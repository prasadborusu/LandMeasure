import geographiclib from 'geographiclib-geodesic';

const { Geodesic } = geographiclib;

export const WGS84_A = 6378137.0; // semi-major axis in meters
export const WGS84_F = 1 / 298.257223563; // flattening

/**
 * Calculates geodesic distance between two points on the WGS84 ellipsoid.
 * Uses Karney's inverse geodesic calculation via GeographicLib.
 * Returns geodesic distance in meters (s12).
 */
export function calculateGeodesicDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const result = Geodesic.WGS84.Inverse(lat1, lon1, lat2, lon2);
  return result.s12;
}

/**
 * Calculates geodesic midpoint along the geodesic line between two coordinates.
 */
export function calculateGeodesicMidpoint(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): { lat: number; lng: number } {
  const inverse = Geodesic.WGS84.Inverse(lat1, lon1, lat2, lon2);
  const halfDistance = inverse.s12 / 2;
  const direct = Geodesic.WGS84.Direct(lat1, lon1, inverse.azi1, halfDistance);
  return { lat: direct.lat2, lng: direct.lon2 };
}

export interface GeodesicPolygonResult {
  number: number;
  perimeterMeters: number;
  areaSquareMeters: number;
}

/**
 * Calculates land polygon area and perimeter using GeographicLib WGS84 PolygonArea algorithm.
 * The polygon is automatically closed from the last vertex back to the first vertex.
 */
export function calculateGeodesicPolygon(
  coordinates: { lat: number; lng: number }[]
): GeodesicPolygonResult {
  if (coordinates.length < 3) {
    return {
      number: coordinates.length,
      perimeterMeters: 0,
      areaSquareMeters: 0,
    };
  }

  // polyline = false specifies a closed polygon
  const polygon = Geodesic.WGS84.Polygon(false);

  for (const pt of coordinates) {
    polygon.AddPoint(pt.lat, pt.lng);
  }

  // Compute(reverse = false, sign = true) returns signed area
  // Regardless of whether user drew clockwise or counter-clockwise, Math.abs yields the parcel area
  const result = polygon.Compute(false, true);

  let parcelArea = Math.abs(result.area);
  const WGS84_TOTAL_AREA = 510065621724088.5;
  if (parcelArea > WGS84_TOTAL_AREA / 2) {
    parcelArea = WGS84_TOTAL_AREA - parcelArea;
  }

  return {
    number: result.number,
    perimeterMeters: Math.abs(result.perimeter),
    areaSquareMeters: parcelArea,
  };
}
