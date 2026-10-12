import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bell, 
  BellRing, 
  Mail, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  LogIn, 
  Sparkles, 
  GraduationCap, 
  Send, 
  Trash2, 
  Layers, 
  SlidersHorizontal,
  Info,
  ArrowRight,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { College, CutoffAlert, ReservationCategory } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { 
  saveCutoffAlert, 
  removeCutoffAlert, 
  subscribeToCutoffAlert, 
  sendSampleCutoffNotification 
} from '../../firebase/services';

interface CutoffAlertModalProps {
  college: College;
  isOpen: boolean;
  onClose: () => void;
  onAlertStatusChange?: (isActive: boolean) => void;
}

const CATEGORIES: ReservationCategory[] = ['OC', 'BC-A', 'BC-B', 'BC-C', 'BC-D', 'BC-E', 'SC', 'ST', 'EWS'];

export const CutoffAlertModal: React.FC<CutoffAlertModalProps> = ({
  college,
  isOpen,
  onClose,
  onAlertStatusChange,
}) => {
  const { user, openAuthModal, loginWithGoogle } = useAuth();

  const isRegistered = Boolean(user && !user.isAnonymous);

  const [existingAlert, setExistingAlert] = useState<CutoffAlert | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(true);

  // Form State
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyInApp, setNotifyInApp] = useState(true);
  const [targetEmail, setTargetEmail] = useState('');
  const [category, setCategory] = useState<ReservationCategory>('OC');
  const [monitorAllBranches, setMonitorAllBranches] = useState(true);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [triggerCondition, setTriggerCondition] = useState<'any_change' | 'significant_shift' | 'round_allotment'>('any_change');
  const [targetRank, setTargetRank] = useState<string>('');

  // UI status
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Available branches in this college
  const availableBranches = React.useMemo(() => {
    return college.cutoffs.map((c) => ({
      code: c.branchCode,
      name: c.branchName,
      lastRank: c.closingRanks[category] || c.closingRanks.OC || 0,
    }));
  }, [college, category]);

  // Sync existing alert from Firestore
  useEffect(() => {
    if (!isOpen) return;

    if (isRegistered && user) {
      setTargetEmail(user.email || '');
      setLoadingExisting(true);
      const unsubscribe = subscribeToCutoffAlert(
        user.uid,
        college.id,
        (alert) => {
          setExistingAlert(alert);
          setLoadingExisting(false);
          if (alert) {
            setNotifyEmail(alert.notifyEmail);
            setNotifyInApp(alert.notifyInApp);
            setTargetEmail(alert.userEmail || user.email || '');
            setCategory(alert.category);
            if (alert.branches.includes('ALL')) {
              setMonitorAllBranches(true);
              setSelectedBranches([]);
            } else {
              setMonitorAllBranches(false);
              setSelectedBranches(alert.branches);
            }
            setTriggerCondition(alert.triggerCondition);
            if (alert.targetRank) {
              setTargetRank(String(alert.targetRank));
            }
          }
          if (onAlertStatusChange) {
            onAlertStatusChange(Boolean(alert && alert.isActive));
          }
        },
        () => {
          setLoadingExisting(false);
        }
      );

      return () => unsubscribe();
    } else {
      setLoadingExisting(false);
      setExistingAlert(null);
    }
  }, [isOpen, isRegistered, user, college.id]);

  if (!isOpen) return null;

  const handleBranchToggle = (branchCode: string) => {
    setMonitorAllBranches(false);
    setSelectedBranches((prev) => 
      prev.includes(branchCode) 
        ? prev.filter((b) => b !== branchCode) 
        : [...prev, branchCode]
    );
  };

  const handleSaveAlert = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user || !isRegistered) {
      openAuthModal('signup');
      return;
    }

    if (!notifyEmail && !notifyInApp) {
      setErrorMessage('Please select at least one notification channel (Email or In-App).');
      return;
    }

    if (notifyEmail && (!targetEmail || !targetEmail.includes('@'))) {
      setErrorMessage('Please provide a valid email address for notifications.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const branchesToSave = monitorAllBranches || selectedBranches.length === 0 
        ? ['ALL'] 
        : selectedBranches;

      const numRank = targetRank ? parseInt(targetRank, 10) : undefined;

      await saveCutoffAlert(user.uid, college.id, {
        collegeId: college.id,
        collegeCode: college.code,
        collegeName: college.name,
        state: college.state,
        userEmail: targetEmail.trim() || user.email || '',
        notifyEmail,
        notifyInApp,
        counselingCycle: `Upcoming ${college.exam} 2026-2027 Counseling Cycle`,
        category,
        branches: branchesToSave,
        triggerCondition,
        targetRank: isNaN(numRank as number) ? undefined : numRank,
        isActive: true,
      });

      setSuccessMessage('Cutoff change alerts successfully activated! You will receive updates as counseling rounds unfold.');
      if (onAlertStatusChange) onAlertStatusChange(true);

      setTimeout(() => {
        setSuccessMessage(null);
      }, 3500);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save cutoff alert. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!user || !existingAlert) return;
    setIsDeleting(true);
    setErrorMessage(null);
    try {
      await removeCutoffAlert(user.uid, college.id);
      setExistingAlert(null);
      setSuccessMessage('Cutoff alerts turned off for this college.');
      if (onAlertStatusChange) onAlertStatusChange(false);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to disable alerts.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSendTestNotification = async () => {
    if (!user || !isRegistered) return;
    setIsSendingTest(true);
    setErrorMessage(null);
    try {
      await sendSampleCutoffNotification(user.uid, college, category);
      setSuccessMessage('Test notification sent! Check the bell icon in your top navigation to view the live cutoff shift alert.');
      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } catch (err: any) {
      setErrorMessage('Could not generate sample notification: ' + err.message);
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-xl rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white relative">
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
              <BellRing className="w-4 h-4 animate-bounce" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Counseling Cycle Alerts
            </span>
            {existingAlert && existingAlert.isActive && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Alert
              </span>
            )}
          </div>

          <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
            Cutoff Rank Change Notifications
          </h2>
          <p className="text-xs text-slate-300 mt-1 line-clamp-1">
            {college.name} ({college.code}) • {college.exam}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          
          {/* Success Banner */}
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{successMessage}</div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Unregistered User Gate */}
          {!isRegistered ? (
            <div className="space-y-4 py-2">
              <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20 mb-3">
                  <Bell className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  Registered Students Only
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Sign in or register with your email to receive official cutoff shift alerts for <span className="font-semibold text-indigo-700">{college.name}</span> directly in your inbox and candidate dashboard.
                </p>
              </div>

              {/* Value Propositions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 block">Instant Email Alerts</span>
                    <span className="text-slate-500 text-[11px]">Get bullet notifications whenever TSCHE/APSCHE releases round closing ranks.</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start gap-2.5">
                  <Smartphone className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 block">Live In-App Feed</span>
                    <span className="text-slate-500 text-[11px]">Real-time counseling notifications and cutoff delta metrics.</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start gap-2.5">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 block">Category Specific</span>
                    <span className="text-slate-500 text-[11px]">Filter alerts for OC, BC, SC, ST, or EWS reservation ranks.</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 block">Multi-Round Coverage</span>
                    <span className="text-slate-500 text-[11px]">Covers Phase 1, Phase 2, Mop-Up and Spot counseling.</span>
                  </div>
                </div>
              </div>

              {/* Login/Signup CTA */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={() => openAuthModal('signup')}
                  className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Register Free with Email</span>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await loginWithGoogle();
                    } catch (e) {
                      // Handled by context
                    }
                  }}
                  className="py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Google Sign In</span>
                </button>
              </div>
            </div>
          ) : (
            /* Registered User Form */
            <form onSubmit={handleSaveAlert} className="space-y-4">
              
              {/* Counseling Cycle Banner */}
              <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Target Counseling Cycle
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Upcoming 2026-2027 Counseling (Phase 1, Phase 2, Final & Spot Allotments)
                    </div>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded-md">
                  {college.exam}
                </span>
              </div>

              {/* Notification Channels: Email & In-App */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900 block">
                  Alert Delivery Channels
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Email Channel */}
                  <label className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                    notifyEmail 
                      ? 'bg-indigo-50/50 border-indigo-300 shadow-xs' 
                      : 'bg-slate-50 border-slate-200 opacity-70'
                  }`}>
                    <input
                      type="checkbox"
                      checked={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.checked)}
                      className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="text-xs font-bold text-slate-800">Email Alerts</span>
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        Closing rank reports sent directly to inbox
                      </span>
                    </div>
                  </label>

                  {/* In-App Channel */}
                  <label className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                    notifyInApp 
                      ? 'bg-indigo-50/50 border-indigo-300 shadow-xs' 
                      : 'bg-slate-50 border-slate-200 opacity-70'
                  }`}>
                    <input
                      type="checkbox"
                      checked={notifyInApp}
                      onChange={(e) => setNotifyInApp(e.target.checked)}
                      className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="text-xs font-bold text-slate-800">In-App Notifications</span>
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        Dashboard bell alerts & live status badges
                      </span>
                    </div>
                  </label>
                </div>

                {/* Email Address Input (if email is selected) */}
                {notifyEmail && (
                  <div className="pt-1">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="email"
                        value={targetEmail}
                        onChange={(e) => setTargetEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        required={notifyEmail}
                        className="w-full pl-9 pr-24 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                          Candidate Email
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Reservation Category Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900">
                    Reservation Category to Monitor
                  </label>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Tracking cutoffs for <span className="font-bold text-indigo-600">{category}</span>
                  </span>
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-9 gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`py-1.5 px-1 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                        category === cat
                          ? 'bg-indigo-600 text-white shadow-xs scale-102'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Engineering Branches Selection */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900">
                    Engineering Branches
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMonitorAllBranches(!monitorAllBranches);
                      if (!monitorAllBranches) {
                        setSelectedBranches([]);
                      }
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                  >
                    {monitorAllBranches ? 'Filter specific branches' : 'Select all branches'}
                  </button>
                </div>

                {monitorAllBranches ? (
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center justify-between">
                    <span className="font-medium">
                      Monitoring all {availableBranches.length} branches offered at {college.code}
                    </span>
                    <span className="text-[11px] font-bold text-indigo-600 bg-indigo-100/80 px-2 py-0.5 rounded-md">
                      All Courses
                    </span>
                  </div>
                ) : (
                  <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1 divide-y divide-slate-100 bg-white">
                    {availableBranches.map((br) => {
                      const isChecked = selectedBranches.includes(br.code);
                      return (
                        <label 
                          key={br.code}
                          className="pt-1 first:pt-0 flex items-center justify-between text-xs py-1 px-1.5 hover:bg-slate-50 rounded-lg cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleBranchToggle(br.code)}
                              className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                            />
                            <div>
                              <span className="font-bold text-slate-800 font-mono text-[11px] mr-1.5">{br.code}</span>
                              <span className="text-slate-600 text-[11px]">{br.name}</span>
                            </div>
                          </div>
                          {br.lastRank > 0 && (
                            <span className="font-mono text-[10px] text-slate-400">
                              ~{br.lastRank.toLocaleString('en-IN')}
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Alert Trigger Rules */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 block">
                  Notification Trigger Condition
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <label className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    triggerCondition === 'any_change'
                      ? 'bg-indigo-50/50 border-indigo-300 text-indigo-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <input
                        type="radio"
                        name="trigger"
                        checked={triggerCondition === 'any_change'}
                        onChange={() => setTriggerCondition('any_change')}
                        className="text-indigo-600 focus:ring-indigo-500 w-3 h-3"
                      />
                      <span>Any Rank Shift</span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      Alert whenever closing rank changes by even 1 rank.
                    </span>
                  </label>

                  <label className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    triggerCondition === 'significant_shift'
                      ? 'bg-indigo-50/50 border-indigo-300 text-indigo-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <input
                        type="radio"
                        name="trigger"
                        checked={triggerCondition === 'significant_shift'}
                        onChange={() => setTriggerCondition('significant_shift')}
                        className="text-indigo-600 focus:ring-indigo-500 w-3 h-3"
                      />
                      <span>Major Shift (&gt;300)</span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      Only notify if cutoff moves substantially.
                    </span>
                  </label>

                  <label className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    triggerCondition === 'round_allotment'
                      ? 'bg-indigo-50/50 border-indigo-300 text-indigo-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <input
                        type="radio"
                        name="trigger"
                        checked={triggerCondition === 'round_allotment'}
                        onChange={() => setTriggerCondition('round_allotment')}
                        className="text-indigo-600 focus:ring-indigo-500 w-3 h-3"
                      />
                      <span>Round Releases</span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      Notify on Phase 1, Phase 2, & Spot releases.
                    </span>
                  </label>
                </div>
              </div>

              {/* Optional Target Rank */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <span className="font-bold text-slate-800 block">Your EAMCET Rank (Optional)</span>
                  <span className="text-[11px] text-slate-500">Highlight whether shifting cutoffs bring this college into your admission reach.</span>
                </div>
                <input
                  type="number"
                  value={targetRank}
                  onChange={(e) => setTargetRank(e.target.value)}
                  placeholder="e.g. 14500"
                  className="w-28 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold bg-white"
                />
              </div>

              {/* Test Notification Simulator Button */}
              <div className="p-3 bg-indigo-50/40 rounded-xl border border-dashed border-indigo-200 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800 block">Preview In-App Notification</span>
                    <span className="text-[11px] text-slate-500">Send an instant test alert to verify the in-app bell feed.</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSendTestNotification}
                  disabled={isSendingTest}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 text-indigo-600 border border-indigo-200 rounded-lg font-bold text-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3 h-3" />
                  <span>{isSendingTest ? 'Sending...' : 'Test Alert'}</span>
                </button>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                {existingAlert ? (
                  <button
                    type="button"
                    onClick={handleUnsubscribe}
                    disabled={isDeleting || isSaving}
                    className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-rose-200 cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isDeleting ? 'Removing...' : 'Turn Off Alerts'}</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 sm:flex-none px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                  >
                    Close
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 sm:flex-none px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? (
                      <span>Saving Preferences...</span>
                    ) : existingAlert ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Update Preferences</span>
                      </>
                    ) : (
                      <>
                        <Bell className="w-3.5 h-3.5" />
                        <span>Notify Me on Cutoff Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
