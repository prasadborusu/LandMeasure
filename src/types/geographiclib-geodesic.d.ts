declare module 'geographiclib-geodesic' {
  export interface GeodesicInverseResult {
    lat1: number;
    lat2: number;
    lon1: number;
    lon2: number;
    a12: number;
    s12: number; // distance in meters
    azi1: number;
    azi2: number;
  }

  export interface GeodesicDirectResult {
    lat1: number;
    lat2: number;
    lon1: number;
    lon2: number;
    a12: number;
    s12: number;
    azi1: number;
    azi2: number;
  }

  export interface PolygonComputeResult {
    number: number;
    perimeter: number;
    area: number;
  }

  export interface PolygonAreaInstance {
    AddPoint(lat: number, lon: number): void;
    AddEdge(azi: number, s: number): void;
    Clear(): void;
    Compute(reverse: boolean, sign: boolean): PolygonComputeResult;
    TestPoint(lat: number, lon: number, reverse: boolean, sign: boolean): PolygonComputeResult;
    TestEdge(azi: number, s: number, reverse: boolean, sign: boolean): PolygonComputeResult;
  }

  export interface GeodesicInstance {
    a: number; // semi-major axis
    f: number; // flattening
    Inverse(lat1: number, lon1: number, lat2: number, lon2: number): GeodesicInverseResult;
    Direct(lat1: number, lon1: number, azi1: number, s12: number): GeodesicDirectResult;
    Polygon(polyline?: boolean): PolygonAreaInstance;
  }

  export namespace Geodesic {
    export const WGS84: GeodesicInstance;
  }

  const geographiclib: {
    Geodesic: {
      WGS84: GeodesicInstance;
    };
    Constants: Record<string, unknown>;
    Math: Record<string, unknown>;
  };

  export default geographiclib;
}
