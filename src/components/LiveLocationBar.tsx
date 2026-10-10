import { Radio, Crosshair, MapPin, StopCircle } from 'lucide-react';
import type { LocationState } from '../types/measurement';
import { formatCoordinate } from '../services/unitConverter';

interface LiveLocationBarProps {
  location: LocationState;
  isLocating: boolean;
  followUser: boolean;
  onToggleFollow: () => void;
  onToggleLiveTracking: () => void;
  onAddPointAtMyLocation: () => void;
}

export const LiveLocationBar: React.FC<LiveLocationBarProps> = ({
  location,
  isLocating,
  followUser,
  onToggleFollow,
  onToggleLiveTracking,
  onAddPointAtMyLocation,
}) => {
  if (!location.isLiveTracking && !isLocating) return null;

  // Accuracy quality assessment
  const getAccuracyBadge = (accuracy: number) => {
    if (accuracy <= 5) {
      return { label: `±${accuracy.toFixed(1)}m (High)`, bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
    if (accuracy <= 15) {
      return { label: `±${accuracy.toFixed(1)}m (Good)`, bg: 'bg-blue-50 text-blue-700 border-blue-200' };
    }
    return { label: `±${accuracy.toFixed(0)}m (Approx)`, bg: 'bg-amber-50 text-amber-700 border-amber-200' };
  };

  const badge = getAccuracyBadge(location.accuracy);

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 w-[94vw] max-w-xl bg-white/95 backdrop-blur-md border border-gray-200/90 rounded-2xl shadow-xl p-3 sm:px-4 sm:py-3 animate-in fade-in slide-in-from-top-3 duration-200 select-none">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Left: Pulse Indicator & Telemetry */}
        <div className="flex items-center space-x-2.5">
          <div className="relative flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping absolute opacity-75" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 relative" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-900 tracking-tight flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-emerald-600" />
                Live GPS Active
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                {badge.label}
              </span>
            </div>

            <div className="text-[11px] font-mono text-gray-600 flex items-center gap-2 mt-0.5">
              <span>{formatCoordinate(location.lat)}°, {formatCoordinate(location.lng)}°</span>
              {location.speed != null && location.speed > 0 && (
                <span className="hidden sm:inline text-gray-400">
                  • {(location.speed * 3.6).toFixed(1)} km/h
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Add Point at My Location */}
          <button
            onClick={onAddPointAtMyLocation}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition shadow-xs"
            title="Record current GPS coordinates as a land boundary corner point"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Mark Corner</span>
          </button>

          {/* Follow Camera Toggle */}
          <button
            onClick={onToggleFollow}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 border ${
              followUser
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200'
            }`}
            title={followUser ? 'Map auto-centers as you walk (Active)' : 'Click to lock map to your position'}
          >
            <Crosshair className={`w-3.5 h-3.5 ${followUser ? 'text-blue-600' : 'text-gray-500'}`} />
            <span className="hidden sm:inline">{followUser ? 'Following' : 'Center'}</span>
          </button>

          {/* Stop Tracking */}
          <button
            onClick={onToggleLiveTracking}
            className="p-1.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition active:scale-95"
            title="Stop Live GPS Tracking"
          >
            <StopCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
