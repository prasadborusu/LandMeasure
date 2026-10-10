import {
  Undo2,
  Redo2,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Info,
  ChevronRight,
  ShieldCheck,
  MapPin,
} from 'lucide-react';
import type { LatLngPoint, AreaUnit, MeasurementResultData } from '../types/measurement';
import { UnitSelector } from './UnitSelector';
import {
  convertArea,
  formatNumber,
  formatPerimeter,
  formatCoordinate,
  UNIT_LABELS,
} from '../services/unitConverter';

interface MeasurementPanelProps {
  points: LatLngPoint[];
  result: MeasurementResultData;
  unit: AreaUnit;
  canUndo: boolean;
  canRedo: boolean;
  selectedPointId: string | null;
  isLocationActive?: boolean;
  isLiveTracking?: boolean;
  onAddPointAtLocation?: () => void;
  onSelectUnit: (unit: AreaUnit) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onFinish: () => void;
  onSelectPoint: (id: string) => void;
  onDeletePoint: (id: string) => void;
  onOpenAccuracyInfo: () => void;
}

export const MeasurementPanel: React.FC<MeasurementPanelProps> = ({
  points,
  result,
  unit,
  canUndo,
  canRedo,
  selectedPointId,
  isLocationActive,
  isLiveTracking,
  onAddPointAtLocation,
  onSelectUnit,
  onUndo,
  onRedo,
  onClear,
  onFinish,
  onSelectPoint,
  onDeletePoint,
  onOpenAccuracyInfo,
}) => {
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
    <aside className="w-80 lg:w-96 bg-white border-l border-gray-200 h-full flex flex-col shadow-xs select-none shrink-0 z-20">
      {/* Panel Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            Land Measurement
          </h2>
          <span className="text-[11px] text-gray-500">Live Geodesic Calculator</span>
        </div>

        {/* Undo / Redo / Clear Quick Actions */}
        <div className="flex items-center space-x-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClear}
            disabled={points.length === 0}
            className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent transition"
            title="Clear All Points"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Stats Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Primary Area Display Card */}
        <div className="bg-gradient-to-br from-emerald-50/80 to-emerald-100/30 border border-emerald-200/80 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Land Area
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-white/80 px-2 py-0.5 rounded-full border border-emerald-200">
              {activeUnitConfig.name}
            </span>
          </div>

          <div className="flex items-baseline space-x-2 my-1">
            <span className="text-3xl lg:text-4xl font-extrabold text-emerald-950 tracking-tight">
              {primaryAreaValue}
            </span>
            {primaryAreaValue !== '--' && (
              <span className="text-sm font-semibold text-emerald-700">
                {activeUnitConfig.symbol}
              </span>
            )}
          </div>

          {/* Secondary Square Meters reference */}
          <div className="pt-2 mt-2 border-t border-emerald-200/60 flex items-center justify-between text-xs text-emerald-900">
            <span className="text-emerald-700/80">Metric Area:</span>
            <span className="font-bold font-mono">
              {secondaryM2Value} {secondaryM2Value !== '--' ? 'm²' : ''}
            </span>
          </div>
        </div>

        {/* Perimeter & Points Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Perimeter
            </div>
            <div className="text-lg font-bold text-gray-900">
              {perimeterValue}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">WGS84 closed loop</div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Boundary Points
            </div>
            <div className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
              <span>{points.length}</span>
              {points.length >= 3 && !result.hasSelfIntersection && (
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              )}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">
              {points.length < 3 ? 'Min. 3 required' : 'Polygon closed'}
            </div>
          </div>
        </div>

        {/* Unit Selector Component */}
        <UnitSelector currentUnit={unit} onSelectUnit={onSelectUnit} />

        {/* Validation Error Banner */}
        {result.hasSelfIntersection && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-red-800">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-950">Invalid Boundary</p>
              <p className="mt-0.5 text-red-700 leading-relaxed">
                The boundary lines cross each other. Please drag the corner points so the boundary lines do not overlap.
              </p>
            </div>
          </div>
        )}

        {points.length > 0 && points.length < 3 && !result.hasSelfIntersection && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2 text-xs text-blue-800">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              Tap the map to add at least <strong>{3 - points.length} more point{3 - points.length > 1 ? 's' : ''}</strong> to close the polygon and calculate land area.
            </span>
          </div>
        )}

        {/* Boundary Points List */}
        {points.length > 0 && (
          <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
            <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex items-center justify-between text-xs font-semibold text-gray-600">
              <span>Corners / Vertices ({points.length})</span>
              <span className="text-[10px] text-gray-400">Click to view</span>
            </div>

            <div className="max-h-48 overflow-y-auto divide-y divide-gray-100 text-xs">
              {points.map((pt, idx) => {
                const isSelected = selectedPointId === pt.id;
                const edge = result.edges.find((e) => e.fromIndex === idx);
                return (
                  <div
                    key={pt.id}
                    onClick={() => onSelectPoint(pt.id)}
                    className={`px-3 py-2 flex items-center justify-between cursor-pointer transition ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-900 font-medium'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[11px]">
                        {idx + 1}
                      </span>
                      <div className="font-mono text-[11px] text-gray-600">
                        {formatCoordinate(pt.lat)}, {formatCoordinate(pt.lng)}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {edge && (
                        <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                          {edge.distanceMeters.toFixed(1)}m
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeletePoint(pt.id);
                        }}
                        className="text-gray-400 hover:text-red-600 p-1 rounded"
                        title="Delete vertex"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Accuracy and Method Badge */}
        <div
          onClick={onOpenAccuracyInfo}
          className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl cursor-pointer transition flex items-center justify-between text-xs group"
        >
          <div className="flex items-center space-x-2 text-gray-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <div>
              <div className="font-semibold text-gray-800">WGS84 Geodesic</div>
              <div className="text-[10px] text-gray-500">Karney / GeographicLib</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700 transition" />
        </div>
      </div>

      {/* Panel Bottom Action */}
      <div className="p-4 border-t border-gray-200 bg-white space-y-2">
        {onAddPointAtLocation && (
          <button
            onClick={onAddPointAtLocation}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border active:scale-[0.98] ${
              isLiveTracking || isLocationActive
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
            }`}
            title="Stamp current GPS location as a corner point"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mark Corner at GPS Location</span>
          </button>
        )}

        <button
          onClick={onFinish}
          disabled={points.length < 3 || result.hasSelfIntersection}
          className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-40 disabled:hover:bg-emerald-600 disabled:active:scale-100 transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 min-h-[46px]"
        >
          <CheckCircle className="w-4 h-4" />
          <span>Finish Measurement</span>
        </button>
      </div>
    </aside>
  );
};
