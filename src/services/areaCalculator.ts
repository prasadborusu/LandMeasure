import type { LatLngPoint, MeasurementResultData, EdgeMeasurement } from '../types/measurement';
import { calculateGeodesicPolygon, calculateGeodesicDistance, calculateGeodesicMidpoint } from './geodesic';
import { validateBoundaryPoints } from '../utils/geometryValidation';

export function computeLandMeasurement(points: LatLngPoint[]): MeasurementResultData {
  if (points.length === 0) {
    return {
      areaM2: 0,
      perimeterM: 0,
      pointCount: 0,
      edges: [],
      hasSelfIntersection: false,
      isValidPolygon: false,
    };
  }

  // Calculate edges
  const edges: EdgeMeasurement[] = [];
  const n = points.length;

  if (n === 2) {
    const dist = calculateGeodesicDistance(points[0].lat, points[0].lng, points[1].lat, points[1].lng);
    const mid = calculateGeodesicMidpoint(points[0].lat, points[0].lng, points[1].lat, points[1].lng);
    edges.push({
      fromIndex: 0,
      toIndex: 1,
      fromId: points[0].id,
      toId: points[1].id,
      distanceMeters: dist,
      midLat: mid.lat,
      midLng: mid.lng,
    });

    return {
      areaM2: 0,
      perimeterM: dist,
      pointCount: 2,
      edges,
      hasSelfIntersection: false,
      isValidPolygon: false,
      validationError: 'Add at least 3 points to calculate land area.',
    };
  }

  // When n >= 3, calculate all n closed boundary edges
  for (let i = 0; i < n; i++) {
    const nextIdx = (i + 1) % n;
    const p1 = points[i];
    const p2 = points[nextIdx];
    const dist = calculateGeodesicDistance(p1.lat, p1.lng, p2.lat, p2.lng);
    const mid = calculateGeodesicMidpoint(p1.lat, p1.lng, p2.lat, p2.lng);

    edges.push({
      fromIndex: i,
      toIndex: nextIdx,
      fromId: p1.id,
      toId: p2.id,
      distanceMeters: dist,
      midLat: mid.lat,
      midLng: mid.lng,
    });
  }

  const validation = validateBoundaryPoints(points);

  if (validation.hasSelfIntersection) {
    return {
      areaM2: 0,
      perimeterM: edges.reduce((acc, e) => acc + e.distanceMeters, 0),
      pointCount: n,
      edges,
      hasSelfIntersection: true,
      isValidPolygon: false,
      validationError:
        'Invalid Boundary: The boundary lines cross each other. Please move the points so the property forms a valid boundary.',
    };
  }

  if (!validation.isValid) {
    const errIssue = validation.issues.find((i) => i.type === 'error');
    return {
      areaM2: 0,
      perimeterM: edges.reduce((acc, e) => acc + e.distanceMeters, 0),
      pointCount: n,
      edges,
      hasSelfIntersection: false,
      isValidPolygon: false,
      validationError: errIssue?.message || 'Invalid boundary points.',
    };
  }

  // Authoritative WGS84 Geodesic Polygon calculation
  const polyResult = calculateGeodesicPolygon(points);

  return {
    areaM2: polyResult.areaSquareMeters,
    perimeterM: polyResult.perimeterMeters,
    pointCount: n,
    edges,
    hasSelfIntersection: false,
    isValidPolygon: true,
  };
}
