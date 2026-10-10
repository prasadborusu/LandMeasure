import { useState } from 'react';
import { Copy, Check, Trash2, X } from 'lucide-react';
import type { LatLngPoint } from '../types/measurement';
import { formatCoordinate } from '../services/unitConverter';

interface CoordinatePopupProps {
  point: LatLngPoint;
  totalPoints: number;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export const CoordinatePopup: React.FC<CoordinatePopupProps> = ({
  point,
  totalPoints,
  onClose,
  onDelete,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const latStr = formatCoordinate(point.lat);
  const lngStr = formatCoordinate(point.lng);

  const handleCopy = async () => {
    try {
      const coordText = `${latStr}, ${lngStr}`;
      await navigator.clipboard.writeText(coordText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback copy
      const textArea = document.createElement('textarea');
      textArea.value = `${latStr}, ${lngStr}`;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-4 z-20 w-[90vw] max-w-xs bg-white rounded-xl shadow-xl border border-gray-200 p-4 animate-in fade-in zoom-in-95 duration-150">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
            {point.order}
          </div>
          <span className="font-bold text-gray-900 text-sm">
            Point {point.order} <span className="text-gray-400 font-normal text-xs">of {totalPoints}</span>
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 rounded-lg p-1 hover:bg-gray-100 transition"
          aria-label="Close coordinate popup"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="py-3 space-y-2 text-xs">
        <div className="flex justify-between items-center py-1 px-2.5 bg-gray-50 rounded-lg">
          <span className="text-gray-500 font-medium">Latitude:</span>
          <span className="font-mono font-bold text-gray-800">{latStr}°</span>
        </div>
        <div className="flex justify-between items-center py-1 px-2.5 bg-gray-50 rounded-lg">
          <span className="text-gray-500 font-medium">Longitude:</span>
          <span className="font-mono font-bold text-gray-800">{lngStr}°</span>
        </div>
        <div className="text-[11px] text-gray-400 text-center">
          Drag marker on map to reposition vertex
        </div>
      </div>

      <div className="pt-2 flex gap-2">
        <button
          onClick={handleCopy}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition active:scale-95 ${
            copied
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied!' : 'Copy Coords'}</span>
        </button>

        <button
          onClick={() => onDelete(point.id)}
          className="flex items-center justify-center gap-1 py-2 px-3 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition active:scale-95"
          title="Delete this boundary point"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};
