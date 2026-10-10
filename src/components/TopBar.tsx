import { Layers, Info, Navigation, ShieldCheck } from 'lucide-react';
import type { MapLayerType } from '../types/measurement';

interface TopBarProps {
  layer: MapLayerType;
  isLiveTracking: boolean;
  isLocating: boolean;
  onToggleLayer: () => void;
  onToggleLiveTracking: () => void;
  onOpenAccuracyInfo: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  layer,
  isLiveTracking,
  isLocating,
  onToggleLayer,
  onToggleLiveTracking,
  onOpenAccuracyInfo,
}) => {
  return (
    <header className="h-14 bg-white border-b border-gray-200 px-3 sm:px-4 flex items-center justify-between shrink-0 shadow-xs z-30 select-none">
      {/* Brand logo & method tag */}
      <div className="flex items-center space-x-2.5 sm:space-x-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-600 text-white shadow-xs shrink-0">
          <span className="text-xl leading-none">🌿</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-bold text-gray-900 tracking-tight leading-none">
              Land Measure
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              WGS84 Geodesic
            </span>
          </div>
          <p className="text-[11px] text-gray-500 leading-tight hidden md:block">
            High-precision ellipsoidal land & perimeter calculation
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        {/* Live GPS Tracking Toggle Button */}
        <button
          onClick={onToggleLiveTracking}
          disabled={isLocating}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition active:scale-95 disabled:opacity-50 min-h-[38px] border ${
            isLiveTracking
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-transparent'
          }`}
          title={isLiveTracking ? 'Live GPS Tracking is Active (Click to Pause)' : 'Start Continuous Live GPS Tracking'}
        >
          {isLiveTracking ? (
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span className="text-emerald-700 font-bold">Live GPS</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Navigation className={`w-3.5 h-3.5 text-blue-600 ${isLocating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {isLocating ? 'Locating...' : 'Live GPS'}
              </span>
            </span>
          )}
        </button>

        {/* Layer toggle: Map / Satellite */}
        <button
          onClick={onToggleLayer}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition active:scale-95 min-h-[38px]"
          title={`Switch to ${layer === 'satellite' ? 'Street Map' : 'Satellite Imagery'}`}
        >
          <Layers className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline">{layer === 'satellite' ? 'Satellite' : 'Street Map'}</span>
        </button>

        {/* Accuracy & Math info modal trigger */}
        <button
          onClick={onOpenAccuracyInfo}
          className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition active:scale-95"
          title="How is this calculated? (WGS84 & Karney algorithm info)"
        >
          <Info className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </header>
  );
};
