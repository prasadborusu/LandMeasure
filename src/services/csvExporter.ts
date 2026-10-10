import type { LatLngPoint, MeasurementResultData } from '../types/measurement';
import { convertArea, formatCoordinate } from './unitConverter';

export function generateCsv(points: LatLngPoint[], result: MeasurementResultData): string {
  const lines: string[] = [];

  // Table header
  lines.push('Point,Latitude,Longitude,Distance To Next Point (m)');

  const n = points.length;
  for (let i = 0; i < n; i++) {
    const pt = points[i];
    const edge = result.edges.find((e) => e.fromIndex === i);
    const distStr = edge ? edge.distanceMeters.toFixed(2) : '--';
    lines.push(`${i + 1},${formatCoordinate(pt.lat)},${formatCoordinate(pt.lng)},${distStr}`);
  }

  // Blank separator line
  lines.push('');
  lines.push('Summary Metric,Value');

  const units = convertArea(result.areaM2);
  lines.push(`Area m²,${result.areaM2.toFixed(2)}`);
  lines.push(`Area Acres,${units.acres.toFixed(3)}`);
  lines.push(`Area Cents,${units.cents.toFixed(2)}`);
  lines.push(`Area Hectares,${units.hectares.toFixed(4)}`);
  lines.push(`Area km²,${units.km2.toFixed(4)}`);
  lines.push(`Perimeter m,${result.perimeterM.toFixed(2)}`);
  lines.push(`Number of Points,${n}`);
  lines.push('Calculation Method,WGS84 Geodesic (Karney / GeographicLib)');
  lines.push(`Ellipsoid,WGS84 (a=6378137m f=1/298.257223563)`);
  lines.push(`Measured Date,${new Date().toLocaleString()}`);

  return lines.join('\r\n');
}

export function downloadCsvFile(
  points: LatLngPoint[],
  result: MeasurementResultData,
  filename: string = 'land-measurement.csv'
): void {
  const csvData = generateCsv(points, result);
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
