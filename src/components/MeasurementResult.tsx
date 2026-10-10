import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  FileDown,
  FileSpreadsheet,
  FileCode,
  RotateCcw,
  ShieldCheck,
  Check,
  Edit3,
  Map as MapIcon,
  Loader2,
} from 'lucide-react';
import type { LatLngPoint, AreaUnit, MeasurementResultData, MapLayerType } from '../types/measurement';
import { UnitSelector } from './UnitSelector';
import {
  convertArea,
  formatNumber,
  formatPerimeter,
  formatCoordinate,
  UNIT_LABELS,
} from '../services/unitConverter';
import { exportMeasurementPdf } from '../services/pdfExporter';
import { downloadGeoJsonFile } from '../services/geoJsonExporter';
import { downloadCsvFile } from '../services/csvExporter';
import { generateMapSnapshot } from '../services/mapSnapshot';

interface MeasurementResultProps {
  points: LatLngPoint[];
  result: MeasurementResultData;
  unit: AreaUnit;
  layer?: MapLayerType;
  onSelectUnit: (unit: AreaUnit) => void;
  onResumeEditing: () => void;
  onNewMeasurement: () => void;
  onOpenAccuracyInfo: () => void;
}

export const MeasurementResult: React.FC<MeasurementResultProps> = ({
  points,
  result,
  unit,
  layer = 'satellite',
  onSelectUnit,
  onResumeEditing,
  onNewMeasurement,
  onOpenAccuracyInfo,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [mapSnapshotUrl, setMapSnapshotUrl] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(true);

  const units = convertArea(result.areaM2);
  const activeUnitConfig = UNIT_LABELS[unit];

  // Generate satellite/street map preview snapshot
  useEffect(() => {
    let isMounted = true;
    if (points.length >= 3) {
      setIsLoadingPreview(true);
      generateMapSnapshot(points, layer, 1000, 500)
        .then((url) => {
          if (isMounted) {
            setMapSnapshotUrl(url);
            setIsLoadingPreview(false);
          }
        })
        .catch((err) => {
          console.warn('Could not render map snapshot preview:', err);
          if (isMounted) setIsLoadingPreview(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [points, layer]);

  const handleExportPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await exportMeasurementPdf(points, result, 'Land-Measurement-Report', layer);
      setDownloadSuccess('PDF generated with satellite map imagery');
      setTimeout(() => setDownloadSuccess(null), 3500);
    } catch (e) {
      console.error(e);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleExportGeoJson = () => {
    try {
      downloadGeoJsonFile(points, result, 'land-parcel.geojson');
      setDownloadSuccess('GeoJSON exported');
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (e) {
      console.error(e);
      alert('Failed to export GeoJSON.');
    }
  };

  const handleExportCsv = () => {
    try {
      downloadCsvFile(points, result, 'land-coordinates.csv');
      setDownloadSuccess('CSV exported');
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (e) {
      console.error(e);
      alert('Failed to export CSV.');
    }
  };

  return (
    <div className="absolute inset-0 z-40 bg-white flex flex-col overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-200 select-none">
      {/* Top Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 sm:px-8 py-3.5 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <button
            onClick={onResumeEditing}
            className="flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-gray-900 px-2 py-1 rounded-lg hover:bg-gray-100 transition active:scale-95"
            title="Return to map to edit points"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Edit Points</span>
          </button>
          <span className="text-gray-300">|</span>
          <h2 className="text-base font-bold text-gray-900 tracking-tight">
            Measurement Result
          </h2>
        </div>

        <button
          onClick={onNewMeasurement}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition active:scale-95 min-h-[36px]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Measurement</span>
        </button>
      </div>

      {/* Main Content Container */}
      <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Toast alert if download triggered */}
        {downloadSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 flex items-center gap-2 text-xs font-semibold animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        {/* Real Satellite Map Parcel Preview */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 flex items-center justify-between text-xs font-bold text-gray-700">
            <div className="flex items-center gap-1.5">
              <MapIcon className="w-4 h-4 text-emerald-600" />
              <span>Satellite Parcel Imagery Preview</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              {layer === 'satellite' ? 'Satellite World Imagery' : 'Street Map'}
            </span>
          </div>

          <div className="relative aspect-[2/1] w-full bg-gray-100 flex items-center justify-center overflow-hidden">
            {mapSnapshotUrl ? (
              <img
                src={mapSnapshotUrl}
                alt="Land parcel satellite imagery with boundary overlay"
                className="w-full h-full object-cover animate-in fade-in duration-200"
              />
            ) : isLoadingPreview ? (
              <div className="flex flex-col items-center gap-2 text-gray-400 text-xs">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                <span>Generating high-resolution parcel imagery...</span>
              </div>
            ) : (
              <div className="text-gray-400 text-xs">Parcel map preview unavailable</div>
            )}
          </div>
        </div>

        {/* Primary Measurement Card */}
        <div className="bg-gradient-to-br from-emerald-50/90 via-emerald-100/40 to-emerald-50/50 border border-emerald-200 rounded-2xl p-6 shadow-xs text-center relative overflow-hidden">
          <div className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-1">
            Total Land Area
          </div>

          <div className="flex items-baseline justify-center space-x-2 my-2">
            <span className="text-4xl sm:text-5xl font-black text-emerald-950 tracking-tight">
              {formatNumber(units[unit], activeUnitConfig.decimals)}
            </span>
            <span className="text-xl sm:text-2xl font-bold text-emerald-700">
              {activeUnitConfig.symbol.toUpperCase()}
            </span>
          </div>

          <div className="text-base font-semibold text-emerald-900/80 font-mono">
            {formatNumber(result.areaM2, 2)} m²
          </div>

          <div className="mt-5 pt-4 border-t border-emerald-200/80 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <span className="text-emerald-700 block text-[11px]">Acres</span>
              <span className="font-bold text-emerald-950 font-mono">
                {formatNumber(units.acres, 3)}
              </span>
            </div>
            <div>
              <span className="text-emerald-700 block text-[11px]">Cents</span>
              <span className="font-bold text-emerald-950 font-mono">
                {formatNumber(units.cents, 2)}
              </span>
            </div>
            <div>
              <span className="text-emerald-700 block text-[11px]">Hectares</span>
              <span className="font-bold text-emerald-950 font-mono">
                {formatNumber(units.hectares, 4)}
              </span>
            </div>
          </div>
        </div>

        {/* Unit Selector Toggle */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs">
          <UnitSelector currentUnit={unit} onSelectUnit={onSelectUnit} />
        </div>

        {/* Key Dimensions Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Perimeter
            </div>
            <div className="text-2xl font-extrabold text-gray-900">
              {formatPerimeter(result.perimeterM)}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Geodesic closed loop boundary
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Boundary Points
            </div>
            <div className="text-2xl font-extrabold text-gray-900">
              {points.length}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              WGS84 vertices recorded
            </div>
          </div>
        </div>

        {/* Method & Mathematical Verification Box */}
        <div
          onClick={onOpenAccuracyInfo}
          className="bg-gray-50 hover:bg-gray-100/80 border border-gray-200 rounded-2xl p-4 transition cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Measurement Method
              </div>
              <div className="text-sm font-bold text-gray-900">
                WGS84 Geodesic
              </div>
              <div className="text-xs text-gray-500">
                Karney / GeographicLib Ellipsoidal Model
              </div>
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-white border border-gray-200 px-2.5 py-1 rounded-lg">
            Details
          </span>
        </div>

        {/* Coordinates Table */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Boundary Vertices & Segments
            </h4>
            <span className="text-xs text-gray-500 font-mono">
              {points.length} points
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th className="py-2.5 px-4">#</th>
                  <th className="py-2.5 px-4">Latitude</th>
                  <th className="py-2.5 px-4">Longitude</th>
                  <th className="py-2.5 px-4">To Next</th>
                  <th className="py-2.5 px-4 text-right">Distance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {points.map((pt, idx) => {
                  const nextIdx = (idx + 1) % points.length;
                  const edge = result.edges.find((e) => e.fromIndex === idx);
                  return (
                    <tr key={pt.id} className="hover:bg-gray-50/50">
                      <td className="py-2.5 px-4 font-bold text-emerald-700">
                        P{pt.order}
                      </td>
                      <td className="py-2.5 px-4 font-mono">
                        {formatCoordinate(pt.lat)}°
                      </td>
                      <td className="py-2.5 px-4 font-mono">
                        {formatCoordinate(pt.lng)}°
                      </td>
                      <td className="py-2.5 px-4 text-gray-500">
                        P{pt.order} → P{nextIdx + 1}
                      </td>
                      <td className="py-2.5 px-4 text-right font-semibold font-mono text-gray-900">
                        {edge ? `${edge.distanceMeters.toFixed(2)} m` : '--'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Export Actions Panel */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Export Measurement
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={handleExportPdf}
              disabled={isGeneratingPdf}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition shadow-xs min-h-[44px] disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>Export PDF</span>
                </>
              )}
            </button>

            <button
              onClick={handleExportGeoJson}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 active:scale-95 transition min-h-[44px]"
            >
              <FileCode className="w-4 h-4 text-emerald-700" />
              <span>Export GeoJSON</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 active:scale-95 transition min-h-[44px]"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Footer controls */}
        <div className="flex gap-3 pt-2 pb-8">
          <button
            onClick={onResumeEditing}
            className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 active:scale-95 transition flex items-center justify-center gap-2 min-h-[44px]"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Boundary Points</span>
          </button>

          <button
            onClick={onNewMeasurement}
            className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-gray-900 bg-gray-200 hover:bg-gray-300 active:scale-95 transition flex items-center justify-center gap-2 min-h-[44px]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>New Measurement</span>
          </button>
        </div>
      </div>
    </div>
  );
};
