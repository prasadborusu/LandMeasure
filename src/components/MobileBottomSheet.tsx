import { useState } from 'react';
import {
  Undo2,
  Redo2,
  Trash2,
  CheckCircle,
  AlertTriangle,
  MapPin,
} from 'lucide-react';
import type { LatLngPoint, AreaUnit, MeasurementResultData } from '../types/measurement';
import { UnitSelector } from './UnitSelector';
import {
  convertArea,
  formatNumber,
  formatPerimeter,
  UNIT_LABELS,
} from '../services/unitConverter';

interface MobileBottomSheetProps {
  points: LatLngPoint[];
  result: MeasurementResultData;
  unit: AreaUnit;
  canUndo: boolean;
  canRedo: boolean;
  isLiveTracking?: boolean;
  onAddPointAtLocation?: () => void;
  onSelectUnit: (unit: AreaUnit) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onFinish: () => void;
  onOpenAccuracyInfo: () => void;
}

export const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
  points,
  result,
  unit,
  canUndo,
  canRedo,
  isLiveTracking,
  onAddPointAtLocation,
  onSelectUnit,
  onUndo,
  onRedo,
  onClear,
  onFinish,
  onOpenAccuracyInfo,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const units = convertArea(result.areaM2);
  const activeUnitConfig = UNIT_LABELS[unit];
  const primaryAreaValue =
    result.isValidPolygon && result.areaM2 > 0
      ? formatNumber(units[unit], activeUnitConfig.decimals)
      : '--';
  const secondaryM2Value =
    result.isValidPolygon && result.areaM2 > 0
      ? formatNumber(result.areaM2, 2)
      : '--';
  const perimeterValue =
    result.edges.length > 0
      ? formatPerimeter(result.perimeterM)
      : '--';

  return (
    <div className="md:hidden absolute bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200 rounded-t-3xl shadow-2xl transition-all duration-300">
      {/* Drag handle / Expand toggle */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full pt-2.5 pb-1 flex flex-col items-center justify-center cursor-pointer select-none active:opacity-70 min-h-[28px]"
      >
        <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
      </div>

      {/* Main Bar / Compact View */}
      <div className="px-5 pb-3">
        {/* Quick Area and Perimeter summary */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Land Area
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-emerald-900 tracking-tight">
                {primaryAreaValue}
              </span>
              {primaryAreaValue !== '--' && (
                <span className="text-xs font-bold text-emerald-700">
                  {activeUnitConfig.symbol}
                </span>
              )}
            </div>
            <div className="text-[11px] text-gray-500 font-mono">
              {secondaryM2Value !== '--' ? `${secondaryM2Value} m²` : 'Add points'}
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Perimeter
            </div>
            <div className="text-base font-bold text-gray-900">
              {perimeterValue}
            </div>
            <div className="text-[11px] text-emerald-700 font-medium">
              {points.length} Points
            </div>
          </div>
        </div>

        {/* Validation Error banner if invalid */}
        {result.hasSelfIntersection && (
          <div className="mt-2.5 bg-red-50 border border-red-200 rounded-xl p-2.5 flex items-center gap-2 text-xs text-red-800">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="font-medium">Lines cross each other. Reposition corners.</span>
          </div>
        )}

        {/* Expanded Drawer Area */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-3 animate-in fade-in duration-200">
            <UnitSelector currentUnit={unit} onSelectUnit={onSelectUnit} />

            <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
              <span>Calculation: WGS84 Geodesic</span>
              <button
                onClick={onOpenAccuracyInfo}
                className="text-emerald-700 font-semibold underline"
              >
                Math Info
              </button>
            </div>
          </div>
        )}

        {/* Record Corner at GPS Location button */}
        {onAddPointAtLocation && (
          <div className="mt-2.5">
            <button
              onClick={onAddPointAtLocation}
              className={`w-full h-11 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border active:scale-[0.98] ${
                isLiveTracking
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
              }`}
            >
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Mark Corner at GPS Location</span>
            </button>
          </div>
        )}

        {/* Action Controls (Min touch target 44px) */}
        <div className="mt-2.5 flex items-center gap-2">
          {/* Undo */}
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="w-12 h-11 bg-gray-100 hover:bg-gray-200 active:scale-95 disabled:opacity-40 rounded-xl flex items-center justify-center text-gray-700 transition"
            title="Undo"
            aria-label="Undo"
          >
            <Undo2 className="w-5 h-5" />
          </button>

          {/* Redo */}
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="w-12 h-11 bg-gray-100 hover:bg-gray-200 active:scale-95 disabled:opacity-40 rounded-xl flex items-center justify-center text-gray-700 transition"
            title="Redo"
            aria-label="Redo"
          >
            <Redo2 className="w-5 h-5" />
          </button>

          {/* Clear */}
          <button
            onClick={onClear}
            disabled={points.length === 0}
            className="w-12 h-11 bg-gray-100 hover:bg-red-50 active:scale-95 disabled:opacity-40 rounded-xl flex items-center justify-center text-red-600 transition"
            title="Clear"
            aria-label="Clear points"
          >
            <Trash2 className="w-5 h-5" />
          </button>

          {/* Finish Measurement primary button */}
          <button
            onClick={onFinish}
            disabled={points.length < 3 || result.hasSelfIntersection}
            className="flex-1 h-11 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-40 rounded-xl text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition min-h-[44px]"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Finish Measurement</span>
          </button>
        </div>
      </div>
    </div>
  );
};
