import type { AreaUnit, UnitValues } from '../types/measurement';

export const SQ_METERS_PER_ACRE = 4046.8564224;
export const SQ_METERS_PER_CENT = 40.468564224;
export const SQ_METERS_PER_HECTARE = 10000;
export const SQ_METERS_PER_SQ_KM = 1000000;

export const UNIT_LABELS: Record<AreaUnit, { name: string; symbol: string; decimals: number }> = {
  acres: { name: 'Acres', symbol: 'acres', decimals: 3 },
  m2: { name: 'Square Meters', symbol: 'm²', decimals: 2 },
  cents: { name: 'Cents', symbol: 'cents', decimals: 2 },
  hectares: { name: 'Hectares', symbol: 'ha', decimals: 4 },
  km2: { name: 'Square Kilometers', symbol: 'km²', decimals: 4 },
};

/**
 * Converts area in square meters to all supported units without rounding internal values.
 */
export function convertArea(areaM2: number): UnitValues {
  return {
    m2: areaM2,
    acres: areaM2 / SQ_METERS_PER_ACRE,
    cents: areaM2 / SQ_METERS_PER_CENT,
    hectares: areaM2 / SQ_METERS_PER_HECTARE,
    km2: areaM2 / SQ_METERS_PER_SQ_KM,
  };
}

/**
 * Formats a numeric value with locale thousands separators and fixed decimal precision.
 */
export function formatNumber(value: number, decimals: number = 2): string {
  if (!Number.isFinite(value) || isNaN(value)) return '--';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Formats area value for a given unit.
 */
export function formatAreaValue(areaM2: number, unit: AreaUnit): string {
  if (!Number.isFinite(areaM2) || areaM2 <= 0) return '--';
  const values = convertArea(areaM2);
  const config = UNIT_LABELS[unit];
  return `${formatNumber(values[unit], config.decimals)} ${config.symbol}`;
}

/**
 * Formats perimeter distance in meters.
 */
export function formatPerimeter(perimeterMeters: number): string {
  if (!Number.isFinite(perimeterMeters) || perimeterMeters <= 0) return '--';
  return `${formatNumber(perimeterMeters, 2)} m`;
}

/**
 * Formats edge distance in meters.
 */
export function formatEdgeDistance(distanceMeters: number): string {
  if (!Number.isFinite(distanceMeters) || distanceMeters <= 0) return '0 m';
  if (distanceMeters < 1000) {
    return `${formatNumber(distanceMeters, 2)} m`;
  }
  return `${formatNumber(distanceMeters / 1000, 3)} km`;
}

/**
 * Formats coordinate to standard 6 decimal places.
 */
export function formatCoordinate(val: number): string {
  return val.toFixed(6);
}
