import React, { useState, useMemo } from 'react';
import { 
  MapPin, 
  Navigation, 
  Train, 
  Bus, 
  Plane, 
  ExternalLink, 
  ShieldCheck, 
  Compass,
  Copy,
  Check,
  Building,
  Map as MapIcon,
  Search
} from 'lucide-react';
import { College } from '../../types';
import { getCollegeGeoTransit, TransitPoint } from '../../utils/geoTransit';
import { CollegeDynamicGoogleMap } from './CollegeDynamicGoogleMap';

interface CollegeLocationMapProps {
  college: College;
}

export const CollegeLocationMap: React.FC<CollegeLocationMapProps> = ({ college }) => {
  const geoData = useMemo(() => getCollegeGeoTransit(college), [college]);
  const [copied, setCopied] = useState(false);
  const [activeTransitTypeFilter, setActiveTransitTypeFilter] = useState<'all' | 'metro' | 'railway' | 'bus' | 'airport'>('all');

  const filteredTransitPoints = useMemo(() => {
    if (activeTransitTypeFilter === 'all') return geoData.transitPoints;
    return geoData.transitPoints.filter(t => t.type === activeTransitTypeFilter);
  }, [geoData.transitPoints, activeTransitTypeFilter]);

  // Verified Google Maps Search & Directions links
  const googleMapsUrl = college.googleMapsUrl || 
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${college.name}, ${college.city}, ${college.state}`)}`;

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${college.name}, ${college.address}`
  )}`;

  const nearbyAmenitiesUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `hostels and student PGs near ${college.name}, ${college.city}`
  )}`;

  const handleCopyAddress = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(`${college.name}, ${college.address}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getTransitIcon = (type: TransitPoint['type']) => {
    switch (type) {
      case 'metro':
        return <Train className="w-3.5 h-3.5 text-indigo-600" />;
      case 'railway':
        return <Train className="w-3.5 h-3.5 text-blue-600" />;
      case 'bus':
        return <Bus className="w-3.5 h-3.5 text-emerald-600" />;
      case 'airport':
        return <Plane className="w-3.5 h-3.5 text-purple-600" />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 rounded-2xl border border-indigo-100 p-5 space-y-4">
      {/* Header & Accessibility Score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <span>Campus Location & Transit Guide</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                  {college.city}, {college.state}
                </span>
              </h3>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Verified campus address, transit connectivity nodes, and direct Google Maps access
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <div>
              <div className="text-[10px] uppercase font-bold text-emerald-700 leading-none">
                Transit Score
              </div>
              <div className="text-xs font-extrabold text-emerald-900 mt-0.5">
                {geoData.accessibilityScore}/10 Accessibility
              </div>
            </div>
          </div>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
            title="Open in Google Maps"
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>

          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
            title="Get driving / transit directions"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Directions</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>
        </div>
      </div>

      {/* Dynamic Google Map (Ensured to only render if VITE_GOOGLE_MAPS_API_KEY is available) */}
      <CollegeDynamicGoogleMap college={college} geoData={geoData} />

      {/* Visual Campus Interactive Location Card */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 text-white p-5 shadow-sm">
        {/* Subtle patterned map background effect */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-white/15 text-indigo-200 text-xs font-mono font-bold rounded-lg border border-white/10">
                {college.code}
              </span>
              <span className="text-xs text-slate-300 font-medium">
                {college.city}, {college.state}
              </span>
              <span className="text-xs text-slate-400">
                • Lat: {geoData.coordinates.lat.toFixed(4)}, Lng: {geoData.coordinates.lng.toFixed(4)}
              </span>
            </div>

            <h4 className="text-lg font-black text-white">
              {college.name}
            </h4>

            <p className="text-xs text-slate-300 flex items-start gap-1.5 leading-relaxed">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{college.address}</span>
            </p>
          </div>

          {/* Quick interactive shortcuts inside visual card */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
            <button
              onClick={handleCopyAddress}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
              <span>{copied ? 'Address Copied!' : 'Copy Full Address'}</span>
            </button>

            <a
              href={nearbyAmenitiesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-500/30 hover:bg-indigo-500/50 text-indigo-200 rounded-xl text-xs font-semibold border border-indigo-400/30 transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Explore Hostels & PGs</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Filter Chips for Transit Hubs */}
      <div className="flex items-center gap-1.5 flex-wrap text-xs pt-1">
        <span className="font-bold text-slate-500 uppercase text-[11px] mr-1">
          Transit Connectivity:
        </span>
        {(['all', 'metro', 'bus', 'railway', 'airport'] as const).map((type) => {
          const count = type === 'all' 
            ? geoData.transitPoints.length 
            : geoData.transitPoints.filter(t => t.type === type).length;
          if (type !== 'all' && count === 0) return null;

          return (
            <button
              key={type}
              onClick={() => setActiveTransitTypeFilter(type)}
              className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition-all cursor-pointer ${
                activeTransitTypeFilter === type
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type === 'all' ? 'All Hubs' : type} ({count})
            </button>
          );
        })}
      </div>

      {/* Transit Hub Cards List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {filteredTransitPoints.map((point) => (
          <div
            key={point.id}
            className="p-3 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition-all flex items-start gap-2.5"
          >
            <div className="p-2 bg-slate-50 rounded-lg shrink-0 border border-slate-100">
              {getTransitIcon(point.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {point.name}
                </span>
                <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 shrink-0">
                  {point.distanceKm} km
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                {point.description}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                <span>~{point.travelTimeMins} mins travel</span>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(point.name)}&destination=${encodeURIComponent(college.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline font-semibold inline-flex items-center gap-0.5"
                >
                  <span>Route</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Connectivity Highlights */}
      {geoData.highlights.length > 0 && (
        <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2 text-xs">
          {geoData.highlights.map((h, i) => (
            <span key={i} className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100/80 px-2.5 py-1 rounded-md">
              <Building className="w-3 h-3 text-indigo-500" />
              {h}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
