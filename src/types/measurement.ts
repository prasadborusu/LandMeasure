export interface LatLngPoint {
  id: string;
  lat: number;
  lng: number;
  order: number;
}

export type AreaUnit = 'acres' | 'm2' | 'cents' | 'hectares' | 'km2';

export interface EdgeMeasurement {
  fromIndex: number;
  toIndex: number;
  fromId: string;
  toId: string;
  distanceMeters: number;
  midLat: number;
  midLng: number;
}

export interface MeasurementResultData {
  areaM2: number;
  perimeterM: number;
  pointCount: number;
  edges: EdgeMeasurement[];
  hasSelfIntersection: boolean;
  isValidPolygon: boolean;
  validationError?: string;
}

export type MapLayerType = 'satellite' | 'street';

export type AppMode = 'idle' | 'measuring' | 'result';

export interface LocationState {
  lat: number;
  lng: number;
  accuracy: number;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
  active: boolean;
  isLiveTracking: boolean;
  lastUpdated?: number;
  error?: string;
}

export interface UnitValues {
  m2: number;
  acres: number;
  cents: number;
  hectares: number;
  km2: number;
}
