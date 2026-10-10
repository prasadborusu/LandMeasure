import { useState } from 'react';
import { X, FileDown, FileCode, FileSpreadsheet, Check, Download } from 'lucide-react';
import type { LatLngPoint, MeasurementResultData } from '../types/measurement';
import { exportMeasurementPdf } from '../services/pdfExporter';
import { downloadGeoJsonFile } from '../services/geoJsonExporter';
import { downloadCsvFile } from '../services/csvExporter';

interface ExportModalProps {
  isOpen: boolean;
  points: LatLngPoint[];
  result: MeasurementResultData;
  layer?: 'satellite' | 'street';
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  points,
  result,
  layer = 'satellite',
  onClose,
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = async (type: 'pdf' | 'geojson' | 'csv') => {
    try {
      if (type === 'pdf') {
        await exportMeasurementPdf(points, result, 'Land-Measurement-Report', layer);
      } else if (type === 'geojson') {
        downloadGeoJsonFile(points, result, 'land-parcel.geojson');
      } else {
        downloadCsvFile(points, result, 'land-coordinates.csv');
      }
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2500);
    } catch (e) {
      alert(`Export failed: ${e}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-gray-900">
              Export Measurement
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-lg p-1 hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-gray-500 my-4">
          Export your land boundary coordinates and WGS84 geodesic calculations into standard geospatial and document formats:
        </p>

        <div className="space-y-3">
          {/* PDF Report Option */}
          <div
            onClick={() => handleExport('pdf')}
            className="p-3.5 border border-gray-200 hover:border-emerald-300 rounded-xl hover:bg-emerald-50/40 cursor-pointer transition flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <FileDown className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 group-hover:text-emerald-950">
                  PDF Survey Report
                </h4>
                <p className="text-xs text-gray-500">
                  Print-ready document with boundary diagram, table & metrics
                </p>
              </div>
            </div>
            {copiedType === 'pdf' ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <span className="text-xs font-semibold text-emerald-700 bg-white border border-gray-200 px-2 py-1 rounded-md">
                Download
              </span>
            )}
          </div>

          {/* GeoJSON Option */}
          <div
            onClick={() => handleExport('geojson')}
            className="p-3.5 border border-gray-200 hover:border-emerald-300 rounded-xl hover:bg-emerald-50/40 cursor-pointer transition flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 group-hover:text-emerald-950">
                  GeoJSON Feature
                </h4>
                <p className="text-xs text-gray-500">
                  Standard GIS Polygon with [longitude, latitude] coordinates
                </p>
              </div>
            </div>
            {copiedType === 'geojson' ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <span className="text-xs font-semibold text-emerald-700 bg-white border border-gray-200 px-2 py-1 rounded-md">
                Download
              </span>
            )}
          </div>

          {/* CSV Coordinates Option */}
          <div
            onClick={() => handleExport('csv')}
            className="p-3.5 border border-gray-200 hover:border-emerald-300 rounded-xl hover:bg-emerald-50/40 cursor-pointer transition flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 group-hover:text-emerald-950">
                  CSV Coordinate Table
                </h4>
                <p className="text-xs text-gray-500">
                  Comma-separated coordinates, edge lengths, and summary
                </p>
              </div>
            </div>
            {copiedType === 'csv' ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <span className="text-xs font-semibold text-emerald-700 bg-white border border-gray-200 px-2 py-1 rounded-md">
                Download
              </span>
            )}
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
