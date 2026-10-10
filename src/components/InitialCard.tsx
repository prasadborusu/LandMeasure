import { Navigation, Play, MapPin } from 'lucide-react';

interface InitialCardProps {
  onStartMeasuring: () => void;
  onRequestLocation: () => void;
  isLocating: boolean;
}

export const InitialCard: React.FC<InitialCardProps> = ({
  onStartMeasuring,
  onRequestLocation,
  isLocating,
}) => {
  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 w-[90vw] max-w-sm bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/80 p-6 text-center animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-100 shadow-xs">
        <MapPin className="w-6 h-6" />
      </div>

      <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-2">
        Measure Your Land
      </h2>

      <p className="text-sm text-gray-600 mb-6 leading-relaxed">
        Tap the corners of your land on the map to calculate its area and perimeter using high-precision WGS84 geodesics.
      </p>

      <div className="flex flex-col gap-2.5">
        <button
          onClick={onStartMeasuring}
          className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 min-h-[46px]"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Start Measuring</span>
        </button>

        <button
          onClick={onRequestLocation}
          disabled={isLocating}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 active:scale-[0.98] transition flex items-center justify-center gap-2 min-h-[42px] disabled:opacity-50"
        >
          <Navigation className={`w-3.5 h-3.5 text-blue-600 ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? 'Detecting Location...' : 'Go to Current Location'}</span>
        </button>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-center text-[11px] text-gray-400">
        <span>WGS84 Ellipsoidal Calculation • 100% Client-Side</span>
      </div>
    </div>
  );
};
