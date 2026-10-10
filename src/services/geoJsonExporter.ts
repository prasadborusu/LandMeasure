import type { LatLngPoint, MeasurementResultData } from '../types/measurement';
import { convertArea } from './unitConverter';

export function generateGeoJson(points: LatLngPoint[], result: MeasurementResultData): string {
  if (points.length < 3) {
    throw new Error('At least 3 boundary points are required to generate a GeoJSON polygon.');
  }

  const units = convertArea(result.areaM2);

  // GeoJSON LinearRing requires [longitude, latitude] and must be closed (first == last)
  const coordinates: [number, number][] = points.map((p) => [p.lng, p.lat]);
  coordinates.push([points[0].lng, points[0].lat]); // close the polygon ring

  const feature = {
    type: 'Feature',
    properties: {
      name: 'Land Measurement Parcel',
      area_m2: parseFloat(result.areaM2.toFixed(2)),
      area_acres: parseFloat(units.acres.toFixed(3)),
      area_cents: parseFloat(units.cents.toFixed(2)),
      area_hectares: parseFloat(units.hectares.toFixed(4)),
      area_km2: parseFloat(units.km2.toFixed(4)),
      perimeter_m: parseFloat(result.perimeterM.toFixed(2)),
      points_count: points.length,
      method: 'WGS84 Geodesic (Karney / GeographicLib)',
      datum: 'WGS84 (EPSG:4326)',
      ellipsoid_semi_major_axis_m: 6378137.0,
      ellipsoid_flattening: '1/298.257223563',
      measured_at: new Date().toISOString(),
    },
    geometry: {
      type: 'Polygon',
      coordinates: [coordinates],
    },
  };

  return JSON.stringify(feature, null, 2);
}

export function downloadGeoJsonFile(
  points: LatLngPoint[],
  result: MeasurementResultData,
  filename: string = 'land-measurement.geojson'
): void {
  const jsonStr = generateGeoJson(points, result);
  const blob = new Blob([jsonStr], { type: 'application/geo+json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
