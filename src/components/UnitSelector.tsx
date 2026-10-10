import type { AreaUnit } from '../types/measurement';
import { UNIT_LABELS } from '../services/unitConverter';

interface UnitSelectorProps {
  currentUnit: AreaUnit;
  onSelectUnit: (unit: AreaUnit) => void;
}

export const UnitSelector: React.FC<UnitSelectorProps> = ({ currentUnit, onSelectUnit }) => {
  const units: AreaUnit[] = ['acres', 'm2', 'cents', 'hectares', 'km2'];

  return (
    <div className="w-full">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
        <span>Display Unit</span>
        <span className="text-[11px] font-normal text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
          Active: {UNIT_LABELS[currentUnit].name}
        </span>
      </div>
      <div className="grid grid-cols-5 gap-1 p-1 bg-gray-100 rounded-lg border border-gray-200">
        {units.map((u) => {
          const isActive = currentUnit === u;
          return (
            <button
              key={u}
              onClick={() => onSelectUnit(u)}
              className={`py-1.5 px-1 text-xs font-semibold rounded-md transition text-center truncate ${
                isActive
                  ? 'bg-white text-emerald-700 shadow-xs border border-gray-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
              title={UNIT_LABELS[u].name}
            >
              {UNIT_LABELS[u].symbol}
            </button>
          );
        })}
      </div>
    </div>
  );
};
