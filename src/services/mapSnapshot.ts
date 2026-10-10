import type { LatLngPoint, MapLayerType } from '../types/measurement';
import { formatEdgeDistance } from './unitConverter';
import { calculateGeodesicDistance, calculateGeodesicMidpoint } from './geodesic';

// Web Mercator projection helper
function project(lat: number, lng: number, zoom: number): { x: number; y: number } {
  const sinY = Math.min(Math.max(Math.sin((lat * Math.PI) / 180), -0.9999), 0.9999);
  const scale = 256 * Math.pow(2, zoom);
  const x = scale * (0.5 + lng / 360);
  const y = scale * (0.5 - Math.log((1 + sinY) / (1 - sinY)) / (4 * Math.PI));
  return { x, y };
}

function loadTileImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load tile: ${url}`));
    img.src = url;
  });
}

/**
 * Generates a high-resolution snapshot of the map with the polygon overlay,
 * corner badges, and edge distance labels directly rendered onto a canvas.
 * Returns a base64 JPEG data URL suitable for PDF export and UI previews.
 */
export async function generateMapSnapshot(
  points: LatLngPoint[],
  layer: MapLayerType = 'satellite',
  width: number = 1000,
  height: number = 500
): Promise<string> {
  if (points.length < 3) {
    throw new Error('At least 3 points required for map snapshot');
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');

  // Find bounding box
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  // Compute best zoom level that fits parcel with 28% margin
  let bestZoom = 17;
  for (let z = 19; z >= 10; z--) {
    const pMin = project(maxLat, minLng, z);
    const pMax = project(minLat, maxLng, z);
    const spanX = Math.abs(pMax.x - pMin.x);
    const spanY = Math.abs(pMax.y - pMin.y);
    if (spanX <= width * 0.72 && spanY <= height * 0.72) {
      bestZoom = z;
      break;
    }
  }

  // Calculate center of polygon in pixel coordinates at bestZoom
  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;
  const centerPx = project(centerLat, centerLng, bestZoom);

  // Canvas top-left in global pixel space
  const originX = centerPx.x - width / 2;
  const originY = centerPx.y - height / 2;

  // Determine tile range
  const minTileX = Math.floor(originX / 256);
  const maxTileX = Math.floor((originX + width) / 256);
  const minTileY = Math.floor(originY / 256);
  const maxTileY = Math.floor((originY + height) / 256);

  // Fill background
  ctx.fillStyle = layer === 'satellite' ? '#1c2430' : '#e5e7eb';
  ctx.fillRect(0, 0, width, height);

  // Fetch and draw tiles
  const tilePromises: Promise<void>[] = [];
  const maxTilesAcross = 2 ** bestZoom;

  for (let tx = minTileX; tx <= maxTileX; tx++) {
    for (let ty = minTileY; ty <= maxTileY; ty++) {
      const wrappedTx = ((tx % maxTilesAcross) + maxTilesAcross) % maxTilesAcross;
      if (ty < 0 || ty >= maxTilesAcross) continue;

      let tileUrl = '';
      if (layer === 'satellite') {
        tileUrl = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${bestZoom}/${ty}/${wrappedTx}`;
      } else {
        const sub = ['a', 'b', 'c'][Math.abs((tx + ty) % 3)];
        tileUrl = `https://${sub}.tile.openstreetmap.org/${bestZoom}/${wrappedTx}/${ty}.png`;
      }

      const drawX = tx * 256 - originX;
      const drawY = ty * 256 - originY;

      tilePromises.push(
        loadTileImage(tileUrl)
          .then((img) => {
            ctx.drawImage(img, drawX, drawY, 256, 256);
          })
          .catch(() => {
            // Gracefully ignore individual tile failures
          })
      );
    }
  }

  // Wait for all tiles to render
  await Promise.all(tilePromises);

  // Convert points to canvas coordinates
  const canvasPoints = points.map((p) => {
    const px = project(p.lat, p.lng, bestZoom);
    return {
      x: px.x - originX,
      y: px.y - originY,
      point: p,
    };
  });

  // Draw Polygon Fill
  ctx.beginPath();
  ctx.moveTo(canvasPoints[0].x, canvasPoints[0].y);
  for (let i = 1; i < canvasPoints.length; i++) {
    ctx.lineTo(canvasPoints[i].x, canvasPoints[i].y);
  }
  ctx.closePath();

  ctx.fillStyle = 'rgba(34, 197, 94, 0.28)'; // 28% green transparent fill
  ctx.fill();

  // Draw Polygon Boundary Line
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = '#16a34a';
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke();

  // Draw Edge Distance Badges
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const nextIdx = (i + 1) % n;
    const p1 = points[i];
    const p2 = points[nextIdx];
    const dist = calculateGeodesicDistance(p1.lat, p1.lng, p2.lat, p2.lng);
    const mid = calculateGeodesicMidpoint(p1.lat, p1.lng, p2.lat, p2.lng);
    const midPx = project(mid.lat, mid.lng, bestZoom);
    const mx = midPx.x - originX;
    const my = midPx.y - originY;

    // Draw badge pill
    const distText = formatEdgeDistance(dist);
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    const textMetrics = ctx.measureText(distText);
    const pillW = textMetrics.width + 14;
    const pillH = 20;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = 4;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(mx - pillW / 2, my - pillH / 2, pillW, pillH, 10);
    ctx.fill();
    ctx.restore();

    ctx.lineWidth = 1;
    ctx.strokeStyle = '#cbd5e1';
    ctx.stroke();

    ctx.fillStyle = '#15803d';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(distText, mx, my);
  }

  // Draw Numbered Vertex Pins
  canvasPoints.forEach((cp, idx) => {
    const r = 13;
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;

    // White disc
    ctx.beginPath();
    ctx.arc(cp.x, cp.y, r, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();

    // Green border
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#16a34a';
    ctx.stroke();

    // Number text
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#15803d';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(idx + 1), cp.x, cp.y);
  });

  // Attribution badge
  const attribution =
    layer === 'satellite'
      ? 'Imagery © Esri, Earthstar Geographics'
      : 'Map © OpenStreetMap contributors';
  ctx.font = '9px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 3;
  ctx.textAlign = 'right';
  ctx.fillText(attribution, width - 10, height - 8);

  return canvas.toDataURL('image/jpeg', 0.92);
}
