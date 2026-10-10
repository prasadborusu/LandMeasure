import type { LatLngPoint } from '../types/measurement';
import { calculateGeodesicDistance } from '../services/geodesic';

export interface ValidationIssue {
  type: 'error' | 'warning';
  message: string;
}

export interface PolygonValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  hasSelfIntersection: boolean;
}

/**
 * Validates coordinate limits:
 * -90 <= latitude <= 90
 * -180 <= longitude <= 180
 */
export function isValidCoordinate(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

/**
 * Checks if two line segments (p1-p2) and (p3-p4) intersect in 2D space.
 * Excludes endpoints touching when they are adjacent segments.
 */
function ccw(ax: number, ay: number, bx: number, by: number, cx: number, cy: number): number {
  return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
}

function isBetween(a: number, b: number, c: number): boolean {
  return Math.min(a, b) - 1e-9 <= c && c <= Math.max(a, b) + 1e-9;
}

function onSegment(px: number, py: number, qx: number, qy: number, rx: number, ry: number): boolean {
  return (
    isBetween(px, rx, qx) &&
    isBetween(py, ry, qy) &&
    Math.abs(ccw(px, py, rx, ry, qx, qy)) < 1e-9
  );
}

export function doSegmentsIntersectStrict(
  p1: { lat: number; lng: number },
  p2: { lat: number; lng: number },
  p3: { lat: number; lng: number },
  p4: { lat: number; lng: number }
): boolean {
  const d1 = ccw(p3.lng, p3.lat, p4.lng, p4.lat, p1.lng, p1.lat);
  const d2 = ccw(p3.lng, p3.lat, p4.lng, p4.lat, p2.lng, p2.lat);
  const d3 = ccw(p1.lng, p1.lat, p2.lng, p2.lat, p3.lng, p3.lat);
  const d4 = ccw(p1.lng, p1.lat, p2.lng, p2.lat, p4.lng, p4.lat);

  // Strict straddling test
  if (((d1 > 1e-9 && d2 < -1e-9) || (d1 < -1e-9 && d2 > 1e-9)) &&
      ((d3 > 1e-9 && d4 < -1e-9) || (d3 < -1e-9 && d4 > 1e-9))) {
    return true;
  }

  // Collinear point-on-segment checks (excluding identical endpoints)
  if (Math.abs(d1) < 1e-9 && onSegment(p3.lng, p3.lat, p1.lng, p1.lat, p4.lng, p4.lat)) return true;
  if (Math.abs(d2) < 1e-9 && onSegment(p3.lng, p3.lat, p2.lng, p2.lat, p4.lng, p4.lat)) return true;
  if (Math.abs(d3) < 1e-9 && onSegment(p1.lng, p1.lat, p3.lng, p3.lat, p2.lng, p2.lat)) return true;
  if (Math.abs(d4) < 1e-9 && onSegment(p1.lng, p1.lat, p4.lng, p4.lat, p2.lng, p2.lat)) return true;

  return false;
}

/**
 * Checks a closed polygon for self-intersections among non-adjacent edges.
 */
export function checkPolygonSelfIntersection(points: { lat: number; lng: number }[]): boolean {
  const n = points.length;
  if (n < 4) return false;

  for (let i = 0; i < n; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % n];

    // For edge i, check against edges j that are not adjacent to edge i
    for (let j = i + 1; j < n; j++) {
      // Adjacent edge checks:
      // (j === i + 1) is adjacent
      // (i === 0 && j === n - 1) is adjacent
      if (j === (i + 1) % n || i === (j + 1) % n) continue;
      if (i === 0 && j === n - 1) continue;

      const p3 = points[j];
      const p4 = points[(j + 1) % n];

      if (doSegmentsIntersectStrict(p1, p2, p3, p4)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Validates a list of boundary points for land measurement.
 */
export function validateBoundaryPoints(points: LatLngPoint[]): PolygonValidationResult {
  const issues: ValidationIssue[] = [];
  let hasSelfIntersection = false;

  // 1. Coordinate range check
  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    if (!isValidCoordinate(pt.lat, pt.lng)) {
      issues.push({
        type: 'error',
        message: `Point ${i + 1} has invalid coordinates (Lat: ${pt.lat}, Lng: ${pt.lng}).`,
      });
    }
  }

  // 2. Minimum points check
  if (points.length < 3) {
    issues.push({
      type: 'warning',
      message: 'Add at least 3 points to calculate land area.',
    });
    return {
      isValid: false,
      issues,
      hasSelfIntersection: false,
    };
  }

  // 3. Consecutive duplicates and proximity check (< 0.2m)
  for (let i = 0; i < points.length; i++) {
    const nextIdx = (i + 1) % points.length;
    const p1 = points[i];
    const p2 = points[nextIdx];
    
    // Distance check
    const dist = calculateGeodesicDistance(p1.lat, p1.lng, p2.lat, p2.lng);
    if (dist < 0.2) {
      issues.push({
        type: 'warning',
        message: `Points ${i + 1} and ${nextIdx + 1} are practically identical (${dist.toFixed(2)} m apart).`,
      });
    }
  }

  // 4. Self intersection check
  hasSelfIntersection = checkPolygonSelfIntersection(points);
  if (hasSelfIntersection) {
    issues.push({
      type: 'error',
      message:
        'Invalid Boundary: The boundary lines cross each other. Please move the points so the property forms a valid boundary.',
    });
  }

  const isValid = issues.filter((i) => i.type === 'error').length === 0;

  return {
    isValid,
    issues,
    hasSelfIntersection,
  };
}
