/// <reference types="@types/google.maps" />
import React, { useEffect, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { College } from '../../types';
import { CollegeGeoTransitData, TransitPoint } from '../../utils/geoTransit';
import { 
  MapPin, 
  RotateCcw, 
  Navigation, 
  ExternalLink, 
  AlertCircle, 
  Loader2,
  Bus
} from 'lucide-react';

interface CollegeDynamicGoogleMapProps {
  college: College;
  geoData: CollegeGeoTransitData;
}

export const CollegeDynamicGoogleMap: React.FC<CollegeDynamicGoogleMapProps> = ({ college, geoData }) => {
  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();

  // Ensuring it only renders if VITE_GOOGLE_MAPS_API_KEY is available
  if (!apiKey) {
    return null;
  }

  return <GoogleMapRenderer college={college} geoData={geoData} apiKey={apiKey} />;
};

interface GoogleMapRendererProps {
  college: College;
  geoData: CollegeGeoTransitData;
  apiKey: string;
}

const GoogleMapRenderer: React.FC<GoogleMapRendererProps> = ({ college, geoData, apiKey }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [mapStatus, setMapStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>('roadmap');
  const [showTransitMarkers, setShowTransitMarkers] = useState(true);
  const transitMarkersRef = useRef<any[]>([]);

  useEffect(() => {
    let isCancelled = false;

    const initMap = async () => {
      try {
        setMapStatus('loading');
        setErrorMessage(null);

        setOptions({
          key: apiKey,
          v: 'weekly',
        });

        const { Map } = await importLibrary('maps');

        if (isCancelled || !mapContainerRef.current) return;

        const collegeCoords = { 
          lat: geoData.coordinates.lat, 
          lng: geoData.coordinates.lng 
        };

        const map = new Map(mapContainerRef.current, {
          center: collegeCoords,
          zoom: 15,
          mapTypeId: mapType,
          renderingType: 'VECTOR' as any,
          internalUsageAttributionIds: ['gmp_git_agentskills_v1'] as any,
          mapTypeControl: false,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        });

        mapInstanceRef.current = map;

        // Try importing marker library for modern AdvancedMarkerElement
        let collegeMarker: any = null;
        try {
          const { AdvancedMarkerElement, PinElement } = await importLibrary('marker');
          if (AdvancedMarkerElement && PinElement) {
            const pin = new PinElement({
              background: '#4f46e5',
              glyphColor: '#ffffff',
              borderColor: '#312e81',
            });
            collegeMarker = new AdvancedMarkerElement({
              map,
              position: collegeCoords,
              title: college.name,
              content: pin.element,
            });
          }
        } catch {
          // Fallback to standard marker
          collegeMarker = new google.maps.Marker({
            map,
            position: collegeCoords,
            title: college.name,
            animation: google.maps.Animation.DROP,
          });
        }

        // Info Window with college metadata
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="font-family: system-ui, -apple-system, sans-serif; padding: 6px; max-width: 260px; color: #0f172a;">
              <div style="font-size: 13px; font-weight: 800; line-height: 1.25; margin-bottom: 4px;">${college.name}</div>
              <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">${college.address}</div>
              <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                <span style="background: #4f46e5; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700;">CODE: ${college.code}</span>
                <span style="background: #e0e7ff; color: #3730a3; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600;">${college.city}, ${college.state}</span>
              </div>
            </div>
          `,
        });

        if (collegeMarker) {
          if (collegeMarker.addListener) {
            collegeMarker.addListener('click', () => {
              infoWindow.open({ anchor: collegeMarker, map });
            });
          } else if (collegeMarker.element) {
            collegeMarker.element.addEventListener('click', () => {
              infoWindow.open({ anchor: collegeMarker, map });
            });
          }
          // Default open on load
          infoWindow.open({ anchor: collegeMarker, map });
        }

        // Clear existing transit markers
        transitMarkersRef.current.forEach(m => {
          if (m.setMap) m.setMap(null);
          else if (m.map) m.map = null;
        });
        transitMarkersRef.current = [];

        // Add transit points markers
        if (showTransitMarkers && geoData.transitPoints.length > 0) {
          try {
            const { AdvancedMarkerElement, PinElement } = await importLibrary('marker');
            geoData.transitPoints.forEach(point => {
              const getPinColor = (type: TransitPoint['type']) => {
                switch (type) {
                  case 'metro': return '#7c3aed';
                  case 'railway': return '#2563eb';
                  case 'bus': return '#059669';
                  case 'airport': return '#d97706';
                  default: return '#64748b';
                }
              };

              let tMarker: any = null;
              if (AdvancedMarkerElement && PinElement) {
                const pin = new PinElement({
                  background: getPinColor(point.type),
                  glyphColor: '#ffffff',
                  borderColor: '#1e293b',
                  scale: 0.85,
                });
                tMarker = new AdvancedMarkerElement({
                  map,
                  position: { lat: point.lat, lng: point.lng },
                  title: `${point.name} (${point.distanceKm} km)`,
                  content: pin.element,
                });
              } else {
                tMarker = new google.maps.Marker({
                  map,
                  position: { lat: point.lat, lng: point.lng },
                  title: `${point.name} (${point.distanceKm} km)`,
                });
              }

              const tInfoWindow = new google.maps.InfoWindow({
                content: `
                  <div style="font-family: system-ui, -apple-system, sans-serif; padding: 4px; font-size: 11px;">
                    <div style="font-weight: 700; color: #0f172a;">${point.name}</div>
                    <div style="color: #64748b; font-size: 10px;">${point.distanceKm} km away (~${point.travelTimeMins} mins)</div>
                    <div style="text-transform: capitalize; font-weight: 600; color: #4f46e5; margin-top: 2px;">${point.type} connectivity</div>
                  </div>
                `,
              });

              if (tMarker) {
                if (tMarker.addListener) {
                  tMarker.addListener('click', () => tInfoWindow.open({ anchor: tMarker, map }));
                } else if (tMarker.element) {
                  tMarker.element.addEventListener('click', () => tInfoWindow.open({ anchor: tMarker, map }));
                }
                transitMarkersRef.current.push(tMarker);
              }
            });
          } catch (e) {
            console.warn('Failed to load transit markers', e);
          }
        }

        if (!isCancelled) {
          setMapStatus('ready');
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error('Error loading Google Maps:', err);
          setErrorMessage(err?.message || 'Failed to initialize dynamic Google Map.');
          setMapStatus('error');
        }
      }
    };

    initMap();

    return () => {
      isCancelled = true;
    };
  }, [college.id, apiKey, showTransitMarkers]);

  const handleCenterCampus = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo({
        lat: geoData.coordinates.lat,
        lng: geoData.coordinates.lng,
      });
      mapInstanceRef.current.setZoom(15);
    }
  };

  const handleMapTypeChange = (type: 'roadmap' | 'satellite' | 'hybrid') => {
    setMapType(type);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setMapTypeId(type);
    }
  };

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${college.name}, ${college.address}`
  )}`;

  return (
    <div className="bg-white rounded-2xl border border-indigo-200/80 shadow-md overflow-hidden transition-all">
      {/* Top Map Header & Controls */}
      <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
            <MapPin className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wide text-white uppercase">
                Dynamic Campus Map
              </span>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Live Google Maps
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Interactive satellite & street navigation with nearby transit hubs
            </p>
          </div>
        </div>

        {/* Map Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Map Style Selector */}
          <div className="flex items-center bg-white/10 rounded-xl p-0.5 border border-white/10 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => handleMapTypeChange('roadmap')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                mapType === 'roadmap' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              Street
            </button>
            <button
              type="button"
              onClick={() => handleMapTypeChange('satellite')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                mapType === 'satellite' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              Satellite
            </button>
            <button
              type="button"
              onClick={() => handleMapTypeChange('hybrid')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                mapType === 'hybrid' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              Hybrid
            </button>
          </div>

          {/* Center on Campus button */}
          <button
            type="button"
            onClick={handleCenterCampus}
            title="Recenter on Campus"
            className="p-1.5 px-2 bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-white/10 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-300" />
            <span className="hidden md:inline text-[11px]">Center</span>
          </button>

          {/* Toggle Transit Markers */}
          <button
            type="button"
            onClick={() => setShowTransitMarkers(!showTransitMarkers)}
            title="Toggle Nearby Transit Markers"
            className={`p-1.5 px-2 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1 cursor-pointer ${
              showTransitMarkers 
                ? 'bg-indigo-600/60 text-white border-indigo-400/40' 
                : 'bg-white/10 hover:bg-white/20 text-slate-300 border-white/10'
            }`}
          >
            <Bus className="w-3.5 h-3.5 text-emerald-300" />
            <span className="hidden md:inline text-[11px]">Transit Pins</span>
          </button>

          {/* Direct Directions */}
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open turn-by-turn directions"
            className="p-1.5 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shrink-0"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span className="text-[11px]">Navigate</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>
        </div>
      </div>

      {/* Map Display Viewport */}
      <div className="relative w-full h-80 sm:h-96 bg-slate-100">
        {mapStatus === 'loading' && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-xs text-white p-4">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-2" />
            <div className="text-xs font-bold">Loading Live Google Map...</div>
            <div className="text-[11px] text-slate-300 mt-1">
              Locating {college.name} coordinates
            </div>
          </div>
        )}

        {mapStatus === 'error' && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-amber-50 text-amber-900 p-6 text-center">
            <AlertCircle className="w-8 h-8 text-amber-600 mb-2" />
            <div className="text-xs font-bold">Google Maps Load Notice</div>
            <div className="text-[11px] text-amber-700 mt-1 max-w-sm">
              {errorMessage || 'Unable to connect to Google Maps API with the current key.'}
            </div>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold"
            >
              <span>View Location Directly on Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* Map Footer Bar with Transit Legend & Attribution */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3 flex-wrap text-[11px] text-slate-600 font-medium">
          <span className="font-bold text-slate-700">Map Legend:</span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
            <span>Campus</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block" />
            <span>Metro</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
            <span>Railway</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
            <span>Bus Station</span>
          </span>
        </div>

        <div className="text-[10px] text-slate-400 font-medium self-end sm:self-auto">
          Google Maps
        </div>
      </div>
    </div>
  );
};
