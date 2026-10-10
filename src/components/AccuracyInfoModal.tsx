import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Globe2,
  Calculator,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
  ArrowDown,
  Compass,
} from 'lucide-react';

interface AccuracyInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccuracyInfoModal: React.FC<AccuracyInfoModalProps> = ({ isOpen, onClose }) => {
  const [showFormulas, setShowFormulas] = useState<boolean>(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-gray-100 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150 select-none">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 leading-tight">
                How is this calculated?
              </h3>
              <p className="text-[11px] text-gray-500">
                WGS84 Geodesic Algorithm & Precision Architecture
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-lg p-1 hover:bg-gray-100 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4 text-xs sm:text-sm text-gray-600 leading-relaxed">
          {/* 1. Main Precision Card */}
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white rounded-2xl p-4 sm:p-5 shadow-xs relative overflow-hidden">
            <div className="relative z-10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                  Mathematical Precision
                </span>
                <span className="text-[10px] font-semibold bg-white/15 border border-white/20 text-white px-2 py-0.5 rounded-full">
                  WGS84 Ellipsoid
                </span>
              </div>

              <div className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                Geodesic calculations accurate to approximately 15 nanometers
              </div>

              <p className="text-xs text-emerald-100 leading-relaxed pt-0.5">
                GeographicLib&apos;s geodesic algorithms provide extremely high numerical accuracy for
                geodesic distance calculations on the WGS84 ellipsoid.
              </p>

              <div className="pt-2 flex items-center justify-between border-t border-emerald-500/50 text-[11px]">
                <div className="text-emerald-200">
                  Algorithm:{' '}
                  <strong className="text-white font-semibold">Karney / GeographicLib</strong>
                </div>
                <div className="text-[10px] text-emerald-200/90 italic">
                  *Refers to numerical math solution, not GPS receiver error
                </div>
              </div>
            </div>
          </div>

          {/* 2. Mathematical Accuracy vs Real-World Accuracy */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-600" />
              <h4 className="font-bold text-gray-900 text-xs sm:text-sm">
                Mathematical Accuracy vs Real-World Accuracy
              </h4>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              The calculation engine can be extremely precise, but the final measurement also depends
              on the accuracy of the latitude/longitude coordinates used to define the land boundary.
            </p>

            {/* Visual Process Flow */}
            <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
              <div className="flex flex-col items-center justify-center space-y-1.5 text-xs font-semibold text-gray-800">
                <div className="px-3 py-1 bg-gray-100 rounded-md border border-gray-200 w-full max-w-xs">
                  Coordinate Source
                </div>
                <ArrowDown className="w-3.5 h-3.5 text-emerald-600" />
                <div className="px-3 py-1 bg-gray-100 rounded-md border border-gray-200 w-full max-w-xs">
                  Coordinate Accuracy
                </div>
                <ArrowDown className="w-3.5 h-3.5 text-emerald-600" />
                <div className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-md border border-emerald-200 w-full max-w-xs font-bold">
                  WGS84 Geodesic Calculation
                </div>
                <ArrowDown className="w-3.5 h-3.5 text-emerald-600" />
                <div className="px-3 py-1 bg-emerald-600 text-white rounded-md shadow-2xs w-full max-w-xs font-bold">
                  Land Area / Perimeter
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              GeographicLib determines the distance and area from the coordinates you provide. It
              cannot correct errors in the coordinates themselves.
            </p>
          </div>

          {/* 3. Accuracy Hierarchy Section */}
          <div className="border border-gray-200 rounded-2xl p-4 bg-white space-y-3">
            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              Accuracy Hierarchy
            </h4>

            <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-200 text-xs space-y-2">
              <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200">
                <span className="font-bold text-gray-900">Final Land Result</span>
                <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                  Calculated Output
                </span>
              </div>
              <div className="flex justify-center">
                <ArrowDown className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <div className="flex items-center justify-between p-2 bg-emerald-50/50 rounded-lg border border-emerald-200">
                <div>
                  <div className="font-bold text-emerald-950">WGS84 GeographicLib Engine</div>
                  <div className="text-[11px] text-emerald-800">Very high numerical calculation precision (~15 nm)</div>
                </div>
              </div>
              <div className="flex justify-center">
                <ArrowDown className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200">
                <div>
                  <div className="font-bold text-gray-900">Input Coordinates</div>
                  <div className="text-[11px] text-gray-500">GPS / GNSS receiver, map clicks, or satellite pins</div>
                </div>
              </div>
              <div className="flex justify-center">
                <ArrowDown className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <div className="text-center p-1.5 bg-amber-50/80 rounded-lg border border-amber-200 text-amber-900 text-[11px] font-medium">
                Real-world positional uncertainty
              </div>
            </div>

            <p className="text-xs text-gray-500 italic text-center">
              The final measurement cannot be more accurate than the coordinates defining the boundary.
            </p>
          </div>

          {/* 4. Calculation Methods Table */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white text-xs">
            <div className="bg-gray-50 px-3.5 py-2.5 border-b border-gray-200 font-bold text-gray-800">
              Calculation Methods
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 text-gray-500 font-semibold border-b border-gray-100 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3">Model</th>
                    <th className="py-2.5 px-3">Recommended Use</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  <tr className="bg-emerald-50/40 font-medium">
                    <td className="py-2.5 px-3 text-emerald-950 font-bold">Karney Geodesic</td>
                    <td className="py-2.5 px-3 text-gray-700">WGS84 ellipsoid</td>
                    <td className="py-2.5 px-3 text-emerald-800 font-semibold">High-accuracy land measurement</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-gray-700">Haversine</td>
                    <td className="py-2.5 px-3 text-gray-500">Spherical Earth</td>
                    <td className="py-2.5 px-3 text-gray-600">Approximate distance</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-gray-700">Web Mercator planar</td>
                    <td className="py-2.5 px-3 text-gray-500">Map projection</td>
                    <td className="py-2.5 px-3 text-gray-600">
                      Visualization, not authoritative land area
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-gray-50/60 border-t border-gray-100 text-[11px] text-gray-500 leading-normal">
              The error of approximate methods depends on location, distance, polygon geometry,
              projection, and other factors. Therefore, no single universal percentage error is appropriate.
            </div>
          </div>

          {/* 5. Coordinate Source Matters */}
          <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4 space-y-2.5 text-xs text-blue-950">
            <h4 className="font-bold text-blue-950 text-xs sm:text-sm">
              Coordinate Source Matters
            </h4>
            <p className="text-blue-900 leading-relaxed">
              Real-world positional accuracy depends on the device, GNSS conditions, correction
              services, map/satellite data source, atmospheric conditions, multipath, and other factors.
            </p>

            <div className="space-y-1.5 pt-1 text-xs">
              <div className="p-2 bg-white/80 rounded-xl border border-blue-100 flex items-start gap-2">
                <span className="font-bold text-blue-900 shrink-0">Typical smartphone location:</span>
                <span className="text-blue-800">Accuracy varies by device and conditions</span>
              </div>
              <div className="p-2 bg-white/80 rounded-xl border border-blue-100 flex items-start gap-2">
                <span className="font-bold text-blue-900 shrink-0">High-quality GNSS:</span>
                <span className="text-blue-800">
                  Accuracy depends on receiver, corrections and field conditions
                </span>
              </div>
              <div className="p-2 bg-white/80 rounded-xl border border-blue-100 flex items-start gap-2">
                <span className="font-bold text-blue-900 shrink-0">Survey-grade GNSS / RTK:</span>
                <span className="text-blue-800">
                  Can provide centimeter-level positioning under suitable conditions
                </span>
              </div>
            </div>
          </div>

          {/* 6. Expandable Mathematical Formulas Section */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
            <button
              onClick={() => setShowFormulas(!showFormulas)}
              className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition flex items-center justify-between text-xs font-bold text-gray-800"
            >
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-600" />
                <span>Exact Mathematical Formulas Used</span>
              </div>
              {showFormulas ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {showFormulas && (
              <div className="p-4 space-y-3.5 text-xs text-gray-700 bg-gray-50/40 border-t border-gray-200">
                {/* WGS84 Reference Ellipsoid */}
                <div>
                  <div className="font-bold text-gray-900 mb-1">
                    1. Reference Ellipsoid: WGS84
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-200 space-y-1 font-mono text-[11px]">
                    <div>Ellipsoid: WGS84</div>
                    <div>Semi-major axis (a): 6,378,137 m</div>
                    <div>Flattening (f): 1 / 298.257223563</div>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1.5 leading-normal">
                    Unlike a simple spherical model, WGS84 represents Earth as an oblate ellipsoid.
                    GeographicLib&apos;s Karney algorithm computes geodesics on this ellipsoid.
                  </p>
                </div>

                {/* Boundary Distance Calculation */}
                <div>
                  <div className="font-bold text-gray-900 mb-1">
                    2. Boundary Distance Calculation
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-200 space-y-1 font-mono text-[11px]">
                    <div className="text-emerald-700 font-bold">WGS84 Geodesic Inverse</div>
                    <div>Karney / GeographicLib</div>
                    <div className="text-gray-500 text-[10px] pt-1">
                      s₁₂ = b · ∫ [ √(1 + k² · sin²σ) ] dσ (Clairaut relation)
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1.5 leading-normal">
                    Each boundary segment is calculated as the shortest geodesic between its two
                    geographic coordinates on the WGS84 ellipsoid.
                  </p>
                </div>

                {/* Land Area Calculation */}
                <div>
                  <div className="font-bold text-gray-900 mb-1">
                    3. Land Area Calculation
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-200 space-y-1 font-mono text-[11px]">
                    <div className="text-emerald-700 font-bold">Geodesic Polygon Area</div>
                    <div>WGS84, Karney / GeographicLib</div>
                    <div className="text-gray-500 text-[10px] pt-1">
                      Area = | ∑ ΔA_(i, i+1) | (Gauss-Bonnet ellipsoidal integral)
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1.5 leading-normal">
                    The polygon area is calculated on the WGS84 ellipsoid using GeographicLib&apos;s geodesic
                    polygon-area algorithm.
                  </p>
                </div>

                {/* Unit Conversions */}
                <div>
                  <div className="font-bold text-gray-900 mb-1">
                    4. Unit Conversion Ratios
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-200 space-y-1 font-mono text-[11px]">
                    <div>Acres = Area(m²) / 4046.8564224</div>
                    <div>Cents = Area(m²) / 40.468564224 = Acres × 100</div>
                    <div>Hectares = Area(m²) / 10000</div>
                    <div>km² = Area(m²) / 1000000</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 7. Legal Survey Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-amber-950 text-xs sm:text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>IMPORTANT — LEGAL SURVEY DISCLAIMER</span>
            </div>
            <p className="text-amber-900 leading-relaxed">
              This application provides mathematical geospatial measurements based on the geographic
              coordinates supplied to it. It is intended for estimation, planning, land measurement
              and spatial reference.
            </p>
            <p className="text-amber-900 leading-relaxed font-semibold">
              It does not establish or certify legal property boundaries.
            </p>
            <p className="text-amber-800 leading-relaxed text-[11px]">
              For legal property boundaries, cadastral work, registration, disputes, construction or
              official surveying, consult an authorized land surveyor and use appropriate survey-grade
              equipment and official records.
            </p>
          </div>
        </div>

        {/* Modal Action Button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition active:scale-95 shadow-xs"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
