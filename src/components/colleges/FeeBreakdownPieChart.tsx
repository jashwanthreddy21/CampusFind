import React, { useState, useMemo } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  IndianRupee, 
  PieChart as PieChartIcon, 
  Home, 
  Bus, 
  ShieldCheck, 
  Info, 
  Layers, 
  Sparkles,
  BookOpen,
  Calendar,
  HelpCircle
} from 'lucide-react';
import { College } from '../../types';

interface FeeBreakdownPieChartProps {
  college: College;
}

export const FeeBreakdownPieChart: React.FC<FeeBreakdownPieChartProps> = ({ college }) => {
  const [residentType, setResidentType] = useState<'hosteller' | 'dayscholar'>('hosteller');
  const [timeHorizon, setTimeHorizon] = useState<'annual' | 'fourYear'>('annual');
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  // Format currency in Indian locale (₹)
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Base tuition fee (Annual Convenor Tuition)
  const annualTuition = college.annualFee || 70000;

  // Compute other expenses breakdown
  const feeDetails = useMemo(() => {
    // 1. Hostel & Mess fees
    let hostelMess = 0;
    if (college.hostelFeeApprox) {
      hostelMess = college.hostelFeeApprox;
    } else {
      // Sensible defaults based on college type/stream
      if (college.type === 'Institute of National Importance' || college.name.includes('IIT')) {
        hostelMess = 65000;
      } else if (college.name.includes('NIT') || college.name.includes('IIIT')) {
        hostelMess = 70000;
      } else if (college.ownership === 'Government') {
        hostelMess = 45000;
      } else {
        hostelMess = 85000;
      }
    }

    // 2. Exam, registration and university statutory fee
    const examFee = college.ownership === 'Government' ? 4500 : 7500;

    // 3. Lab, Library, IT & Internet infrastructure
    const labLibraryFee = Math.round(Math.min(18000, Math.max(5000, annualTuition * 0.08)));

    // 4. Student activities, health insurance, campus welfare
    const studentAmenitiesFee = 4000;

    // Day scholar non-hostel other expenses
    const dayScholarOther = examFee + labLibraryFee + studentAmenitiesFee;

    // Hosteller other expenses = hostelMess + academic other fees
    const hostellerOther = hostelMess + dayScholarOther;

    const currentOtherExpenses = residentType === 'hosteller' ? hostellerOther : dayScholarOther;
    const currentTuition = annualTuition;

    const multiplier = timeHorizon === 'fourYear' ? 4 : 1;

    const tuitionTotal = currentTuition * multiplier;
    const otherTotal = currentOtherExpenses * multiplier;
    const grandTotal = tuitionTotal + otherTotal;

    const tuitionPct = grandTotal > 0 ? Math.round((tuitionTotal / grandTotal) * 100) : 50;
    const otherPct = 100 - tuitionPct;

    return {
      hostelMess: hostelMess * multiplier,
      examFee: examFee * multiplier,
      labLibraryFee: labLibraryFee * multiplier,
      studentAmenitiesFee: studentAmenitiesFee * multiplier,
      tuitionTotal,
      otherTotal,
      grandTotal,
      tuitionPct,
      otherPct,
      multiplier
    };
  }, [college, annualTuition, residentType, timeHorizon]);

  // Primary 2-segment comparison data for Pie Chart
  const pieData = [
    {
      name: 'Tuition Fee',
      value: feeDetails.tuitionTotal,
      percentage: feeDetails.tuitionPct,
      color: '#4f46e5', // Indigo 600
      gradient: 'from-indigo-600 to-blue-600',
      description: 'Government/AFRC Approved Convenor Quota Academic Tuition'
    },
    {
      name: 'Other Expenses',
      value: feeDetails.otherTotal,
      percentage: feeDetails.otherPct,
      color: residentType === 'hosteller' ? '#f59e0b' : '#0d9488', // Amber 500 or Teal 600
      gradient: residentType === 'hosteller' ? 'from-amber-500 to-orange-500' : 'from-teal-600 to-emerald-600',
      description: residentType === 'hosteller' 
        ? 'Hostel room, mess meals, university exams & campus amenities'
        : 'University examinations, library, lab amenities & activity fees'
    }
  ];

  // Custom Pie Chart Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold text-sm">
            <span 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: data.color }}
            />
            <span>{data.name}</span>
          </div>
          <div className="text-base font-extrabold text-amber-300">
            {formatCurrency(data.value)}
          </div>
          <div className="text-slate-300">
            {data.percentage}% of total {timeHorizon === 'fourYear' ? '4-year cost' : 'annual cost'}
          </div>
          <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
            {data.description}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
              <PieChartIcon className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-slate-900 text-base">
              Annual Cost Structure & Fee Breakdown
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare official <strong className="text-indigo-700 font-semibold">Tuition Fee</strong> vs <strong className="text-amber-700 font-semibold">Other Expenses</strong>
          </p>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Hosteller vs Day Scholar */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => setResidentType('hosteller')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                residentType === 'hosteller'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Hosteller</span>
            </button>
            <button
              type="button"
              onClick={() => setResidentType('dayscholar')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                residentType === 'dayscholar'
                  ? 'bg-white text-teal-700 shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              <Bus className="w-3.5 h-3.5" />
              <span>Day Scholar</span>
            </button>
          </div>

          {/* 1-Year vs 4-Years */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => setTimeHorizon('annual')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                timeHorizon === 'annual'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              1 Year
            </button>
            <button
              type="button"
              onClick={() => setTimeHorizon('fourYear')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                timeHorizon === 'fourYear'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              4-Year B.Tech
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Visual Pie Chart + Cost Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Pie Chart Visualizer (5 Cols) */}
        <div className="md:col-span-5 flex flex-col items-center justify-center relative">
          <div className="w-full h-56 sm:h-64 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                  onMouseEnter={(_, index) => setHoveredSlice(pieData[index].name)}
                  onMouseLeave={() => setHoveredSlice(null)}
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      stroke="#ffffff"
                      strokeWidth={2}
                      className="transition-all duration-300 hover:opacity-90 cursor-pointer"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Label in Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total {timeHorizon === 'fourYear' ? '4-Yr Cost' : 'Annual Cost'}
              </span>
              <span className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                {formatCurrency(feeDetails.grandTotal)}
              </span>
              <span className="text-[10px] text-indigo-600 font-semibold">
                {timeHorizon === 'fourYear' ? 'Full B.Tech Total' : 'Per Year'}
              </span>
            </div>
          </div>

          {/* Quick Legend under chart */}
          <div className="flex items-center justify-center gap-4 text-xs font-semibold mt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-indigo-600" />
              <span className="text-slate-700">Tuition ({feeDetails.tuitionPct}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-full ${residentType === 'hosteller' ? 'bg-amber-500' : 'bg-teal-600'}`} />
              <span className="text-slate-700">Other ({feeDetails.otherPct}%)</span>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown Comparison Cards (7 Cols) */}
        <div className="md:col-span-7 space-y-3">
          
          {/* Tuition Fee Card */}
          <div className={`p-4 rounded-xl border transition-all ${
            hoveredSlice === 'Tuition Fee' 
              ? 'bg-indigo-50/70 border-indigo-400 ring-2 ring-indigo-200' 
              : 'bg-white border-indigo-200 shadow-2xs'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-indigo-600 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Tuition Fee ({feeDetails.tuitionPct}%)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Mandatory academic convenor fee approved by AFRC / Govt.
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-base font-black text-indigo-700 block">
                  {formatCurrency(feeDetails.tuitionTotal)}
                </span>
                <span className="text-[10px] text-slate-400">
                  {timeHorizon === 'fourYear' ? '4 × ' + formatCurrency(annualTuition) : 'Per Academic Year'}
                </span>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-indigo-100 flex items-center justify-between text-xs text-indigo-900 bg-indigo-50/60 p-2 rounded-lg">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Eligibility for Govt Fee Reimbursement</span>
              </span>
              <span className="font-semibold text-emerald-700">
                100% Eligible (TS/AP)
              </span>
            </div>
          </div>

          {/* Other Expenses Card */}
          <div className={`p-4 rounded-xl border transition-all ${
            hoveredSlice === 'Other Expenses' 
              ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-200' 
              : 'bg-white border-slate-200 shadow-2xs'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-3.5 h-3.5 rounded-full ${residentType === 'hosteller' ? 'bg-amber-500' : 'bg-teal-600'} shrink-0`} />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Other Expenses ({feeDetails.otherPct}%)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {residentType === 'hosteller' ? 'Campus accommodation, mess food, labs & exam dues' : 'Statutory university, library, laboratory & tech dues'}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className={`text-base font-black block ${residentType === 'hosteller' ? 'text-amber-700' : 'text-teal-700'}`}>
                  {formatCurrency(feeDetails.otherTotal)}
                </span>
                <span className="text-[10px] text-slate-400">
                  {timeHorizon === 'fourYear' ? '4-Year Estimated Sum' : 'Per Academic Year'}
                </span>
              </div>
            </div>

            {/* Sub-itemization */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              {residentType === 'hosteller' && (
                <div className="bg-amber-50/60 p-2 rounded-lg border border-amber-100">
                  <div className="text-[10px] text-amber-800 font-semibold flex items-center gap-1">
                    <Home className="w-3 h-3 text-amber-600" />
                    <span>Hostel & Mess Charges</span>
                  </div>
                  <div className="font-bold text-slate-800 mt-0.5">
                    {formatCurrency(feeDetails.hostelMess)}
                  </div>
                </div>
              )}

              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-600 font-semibold flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-indigo-500" />
                  <span>Exam & Univ Statutory Dues</span>
                </div>
                <div className="font-bold text-slate-800 mt-0.5">
                  {formatCurrency(feeDetails.examFee)}
                </div>
              </div>

              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-600 font-semibold flex items-center gap-1">
                  <Layers className="w-3 h-3 text-cyan-600" />
                  <span>Lab, Tech & Library Deposit</span>
                </div>
                <div className="font-bold text-slate-800 mt-0.5">
                  {formatCurrency(feeDetails.labLibraryFee)}
                </div>
              </div>

              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-600 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  <span>Student Amenities & Welfare</span>
                </div>
                <div className="font-bold text-slate-800 mt-0.5">
                  {formatCurrency(feeDetails.studentAmenitiesFee)}
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Advisory Note for Students */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 flex items-start gap-2">
        <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-800 font-semibold">Scholarship & Fee Reimbursement Note:</strong> Students eligible for TS EPASS (Telangana) or Jagananna Vidya Deevena (Andhra Pradesh) or National PM-USP scholarships receive full or partial reimbursement on the <strong className="text-indigo-700">Tuition Fee</strong> portion directly from the respective state/central welfare boards. Other expenses (such as hostel mess and semester exam fees) are typically borne by the candidate or covered via maintenance allowances.
        </p>
      </div>
    </div>
  );
};
