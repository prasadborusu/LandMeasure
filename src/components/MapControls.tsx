import { Navigation, Plus, Minus, Layers, Maximize, Minimize, Crosshair } from 'lucide-react';
import type { MapLayerType } from '../types/measurement';

interface MapControlsProps {
  layer: MapLayerType;
  isLiveTracking: boolean;
  isLocating: boolean;
  followUser: boolean;
  onToggleLayer: () => void;
  onToggleLiveTracking: () => void;
  onToggleFollowUser: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  layer,
  isLiveTracking,
  isLocating,
  followUser,
  onToggleLayer,
  onToggleLiveTracking,
  onToggleFollowUser,
  onZoomIn,
  onZoomOut,
  isFullscreen,
  onToggleFullscreen,
}) => {
  return (
    <div className="absolute right-4 top-4 z-20 flex flex-col gap-2 select-none">
      {/* Live GPS Tracking Button */}
      <button
        onClick={onToggleLiveTracking}
        disabled={isLocating}
        className={`w-11 h-11 backdrop-blur-xs rounded-xl shadow-md border flex items-center justify-center transition active:scale-95 disabled:opacity-50 relative ${
          isLiveTracking
            ? 'bg-emerald-600 text-white border-emerald-700 shadow-emerald-600/30 ring-2 ring-emerald-400/40'
            : 'bg-white/95 text-gray-700 hover:text-blue-600 hover:bg-white border-gray-200/80'
        }`}
        title={isLiveTracking ? 'Live GPS Tracking Active (Click to Pause)' : 'Start Continuous Live GPS Tracking'}
        aria-label="Toggle Live GPS Tracking"
      >
        <Navigation className={`w-5 h-5 ${isLocating ? 'animate-spin' : ''} ${isLiveTracking ? 'fill-white' : ''}`} />
        {isLiveTracking && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white border-2 border-emerald-600"></span>
          </span>
        )}
      </button>

      {/* Recenter / Follow Me Camera Button (when tracking is on) */}
      {isLiveTracking && (
        <button
          onClick={onToggleFollowUser}
          className={`w-11 h-11 backdrop-blur-xs rounded-xl shadow-md border flex items-center justify-center transition active:scale-95 ${
            followUser
              ? 'bg-blue-600 text-white border-blue-700 shadow-blue-600/30'
              : 'bg-white/95 text-gray-700 hover:text-blue-600 hover:bg-white border-gray-200/80'
          }`}
          title={followUser ? 'Camera Following You (Active)' : 'Re-center camera on my position'}
          aria-label="Re-center on user"
        >
          <Crosshair className="w-5 h-5" />
        </button>
      )}

      {/* Layer Switch */}
      <button
        onClick={onToggleLayer}
        className="w-11 h-11 bg-white/95 backdrop-blur-xs rounded-xl shadow-md border border-gray-200/80 flex items-center justify-center text-gray-700 hover:text-emerald-600 hover:bg-white active:scale-95 transition"
        title={`Switch to ${layer === 'satellite' ? 'Standard Map' : 'Satellite Imagery'}`}
        aria-label="Toggle Map Layer"
      >
        <Layers className="w-5 h-5 text-emerald-600" />
      </button>

      {/* Zoom In & Out */}
      <div className="bg-white/95 backdrop-blur-xs rounded-xl shadow-md border border-gray-200/80 overflow-hidden flex flex-col">
        <button
          onClick={onZoomIn}
          className="w-11 h-11 flex items-center justify-center text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition border-b border-gray-100"
          title="Zoom in"
          aria-label="Zoom In"
        >
          <Plus className="w-5 h-5" />
        </button>
        <button
          onClick={onZoomOut}
          className="w-11 h-11 flex items-center justify-center text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition"
          title="Zoom out"
          aria-label="Zoom Out"
        >
          <Minus className="w-5 h-5" />
        </button>
      </div>

      {/* Fullscreen Button if supported */}
      {onToggleFullscreen && (
        <button
          onClick={onToggleFullscreen}
          className="w-11 h-11 bg-white/95 backdrop-blur-xs rounded-xl shadow-md border border-gray-200/80 flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-white active:scale-95 transition hidden sm:flex"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          aria-label="Fullscreen"
        >
          {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </button>
      )}
    </div>
  );
};
