import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import {
  MapContainer,
  TileLayer,
  Polygon,
  Polyline,
  Marker,
  Circle,
  Popup,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { LatLngPoint, MapLayerType, LocationState, EdgeMeasurement } from '../types/measurement';
import { formatEdgeDistance, formatCoordinate } from '../services/unitConverter';

interface MapViewProps {
  points: LatLngPoint[];
  edges: EdgeMeasurement[];
  layer: MapLayerType;
  location: LocationState;
  selectedPointId: string | null;
  mode: 'idle' | 'measuring' | 'result';
  hasSelfIntersection: boolean;
  followUser?: boolean;
  onUserPan?: () => void;
  onMapClick: (lat: number, lng: number) => void;
  onPointDrag: (id: string, lat: number, lng: number, saveToHistory: boolean) => void;
  onPointSelect: (id: string) => void;
}

// Controller component to expose programmatic map methods
interface MapControllerProps {
  location: LocationState;
  points: LatLngPoint[];
  mode: 'idle' | 'measuring' | 'result';
  followUser?: boolean;
  isDraggingVertexRef: React.RefObject<boolean>;
  onUserPan?: () => void;
  onMapClick: (lat: number, lng: number) => void;
}

const MapController: React.FC<MapControllerProps> = ({
  location,
  points,
  mode,
  followUser = true,
  isDraggingVertexRef,
  onUserPan,
  onMapClick,
}) => {
  const map = useMap();
  const initialCenteredRef = useRef<boolean>(false);

  // Map events
  useMapEvents({
    click(e) {
      // If a vertex was just clicked or dragged, ignore map click
      if (isDraggingVertexRef.current) return;
      if (mode === 'measuring' || mode === 'idle') {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
    dragstart() {
      if (onUserPan) {
        onUserPan();
      }
    },
  });

  // First center when location is acquired
  useEffect(() => {
    if (location.active && !initialCenteredRef.current) {
      map.flyTo([location.lat, location.lng], 16, { duration: 1.2 });
      initialCenteredRef.current = true;
    }
  }, [location.active, location.lat, location.lng, map]);

  // Live tracking follow user smoothly
  useEffect(() => {
    if (location.active && location.isLiveTracking && followUser) {
      map.panTo([location.lat, location.lng], { animate: true, duration: 0.6 });
    }
  }, [location.lat, location.lng, location.active, location.isLiveTracking, followUser, map]);

  // Fit bounds when finishing measurement into result view
  useEffect(() => {
    if (mode === 'result' && points.length >= 3) {
      const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
    }
  }, [mode, points, map]);

  return null;
};

// Create DivIcon for vertex markers
const createVertexIcon = (order: number, isSelected: boolean) => {
  return L.divIcon({
    className: 'vertex-marker-icon',
    html: `<div class="vertex-marker-badge ${isSelected ? 'selected' : ''}">${order}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

// Dedicated Draggable Vertex Marker Component
interface VertexMarkerProps {
  point: LatLngPoint;
  isSelected: boolean;
  isDraggable: boolean;
  onSelect: (id: string) => void;
  onDragStart: () => void;
  onDrag: (id: string, lat: number, lng: number) => void;
  onDragEnd: (id: string, lat: number, lng: number) => void;
}

const VertexMarker: React.FC<VertexMarkerProps> = React.memo(({
  point,
  isSelected,
  isDraggable,
  onSelect,
  onDragStart,
  onDrag,
  onDragEnd,
}) => {
  const markerRef = useRef<L.Marker>(null);
  const dragAnimFrameRef = useRef<number | null>(null);

  // Use refs to keep callbacks always current without changing eventHandlers identity
  const onSelectRef = useRef(onSelect);
  const onDragStartRef = useRef(onDragStart);
  const onDragRef = useRef(onDrag);
  const onDragEndRef = useRef(onDragEnd);
  const pointIdRef = useRef(point.id);

  onSelectRef.current = onSelect;
  onDragStartRef.current = onDragStart;
  onDragRef.current = onDrag;
  onDragEndRef.current = onDragEnd;
  pointIdRef.current = point.id;

  // Stable eventHandlers that are NEVER recreated during drag session
  const eventHandlers = useMemo(
    () => ({
      click(e: L.LeafletMouseEvent) {
        L.DomEvent.stopPropagation(e);
        onSelectRef.current(pointIdRef.current);
      },
      dragstart(e: L.LeafletEvent) {
        L.DomEvent.stopPropagation(e);
        onDragStartRef.current();
        const marker = markerRef.current;
        if (marker) {
          const el = marker.getElement();
          if (el) {
            el.classList.add('leaflet-marker-dragging');
          }
        }
      },
      drag() {
        const marker = markerRef.current;
        if (!marker) return;
        const latlng = marker.getLatLng();

        // Throttle state update using requestAnimationFrame for 60fps smooth polygon tracking
        if (dragAnimFrameRef.current !== null) {
          cancelAnimationFrame(dragAnimFrameRef.current);
        }
        dragAnimFrameRef.current = requestAnimationFrame(() => {
          onDragRef.current(pointIdRef.current, latlng.lat, latlng.lng);
        });
      },
      dragend(e: L.LeafletEvent) {
        L.DomEvent.stopPropagation(e);
        if (dragAnimFrameRef.current !== null) {
          cancelAnimationFrame(dragAnimFrameRef.current);
          dragAnimFrameRef.current = null;
        }
        const marker = markerRef.current;
        if (marker) {
          const el = marker.getElement();
          if (el) {
            el.classList.remove('leaflet-marker-dragging');
          }
          const latlng = marker.getLatLng();
          onDragEndRef.current(pointIdRef.current, latlng.lat, latlng.lng);
        }
      },
    }),
    []
  );

  const icon = useMemo(
    () => createVertexIcon(point.order, isSelected),
    [point.order, isSelected]
  );

  return (
    <Marker
      ref={markerRef}
      position={[point.lat, point.lng]}
      icon={icon}
      draggable={isDraggable}
      eventHandlers={eventHandlers}
    />
  );
});

VertexMarker.displayName = 'VertexMarker';

export const MapView: React.FC<MapViewProps> = ({
  points,
  edges,
  layer,
  location,
  selectedPointId,
  mode,
  hasSelfIntersection,
  followUser = true,
  onUserPan,
  onMapClick,
  onPointDrag,
  onPointSelect,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const isDraggingVertexRef = useRef<boolean>(false);

  // Tile configurations with env var support
  const streetTileUrl =
    (import.meta as any).env?.VITE_MAP_TILE_URL ||
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const satelliteTileUrl =
    (import.meta as any).env?.VITE_SATELLITE_TILE_URL ||
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

  // Create DivIcon for edge distance badges
  const createEdgeIcon = (distMeters: number) => {
    return L.divIcon({
      className: 'edge-distance-label',
      html: `<div class="edge-distance-badge"><span>${formatEdgeDistance(distMeters)}</span></div>`,
      iconSize: [80, 20],
      iconAnchor: [40, 10],
    });
  };

  // User live location pulse icon
  const userLocationIcon = useMemo(() => {
    return L.divIcon({
      className: 'user-location-marker',
      html: `
        <div class="user-location-pulse ${location.isLiveTracking ? 'live-tracking' : ''}"></div>
        <div class="user-location-dot"></div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
  }, [location.isLiveTracking]);

  const polygonPositions = useMemo(() => {
    return points.map((p) => [p.lat, p.lng] as [number, number]);
  }, [points]);

  // Drag callbacks
  const handleVertexDragStart = useCallback(() => {
    isDraggingVertexRef.current = true;
  }, []);

  const handleVertexDrag = useCallback(
    (id: string, lat: number, lng: number) => {
      isDraggingVertexRef.current = true;
      onPointDrag(id, lat, lng, false);
    },
    [onPointDrag]
  );

  const handleVertexDragEnd = useCallback(
    (id: string, lat: number, lng: number) => {
      onPointDrag(id, lat, lng, true);
      // Keep dragging flag true briefly to prevent mouseup from triggering a map click
      setTimeout(() => {
        isDraggingVertexRef.current = false;
      }, 150);
    },
    [onPointDrag]
  );

  return (
    <div className="relative w-full h-full overflow-hidden">
      <MapContainer
        center={[location.lat, location.lng]}
        zoom={15}
        zoomControl={false}
        className="w-full h-full"
        ref={mapRef}
      >
        <MapController
          location={location}
          points={points}
          mode={mode}
          followUser={followUser}
          isDraggingVertexRef={isDraggingVertexRef}
          onUserPan={onUserPan}
          onMapClick={onMapClick}
        />

        {/* Dynamic Tile Layer with Satellite and Street fallback */}
        {layer === 'satellite' ? (
          <TileLayer
            key="satellite-layer"
            url={satelliteTileUrl}
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>, Earthstar Geographics'
            maxZoom={19}
          />
        ) : (
          <TileLayer
            key="street-layer"
            url={streetTileUrl}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            maxZoom={19}
          />
        )}

        {/* User GPS Accuracy Circle (in meters) */}
        {location.active && location.accuracy > 0 && (
          <Circle
            center={[location.lat, location.lng]}
            radius={location.accuracy}
            pathOptions={{
              color: '#2563eb',
              fillColor: '#3b82f6',
              fillOpacity: 0.12,
              weight: 1.5,
              dashArray: '3, 4',
            }}
          />
        )}

        {/* User GPS location marker with interactive popup */}
        {location.active && (
          <Marker
            position={[location.lat, location.lng]}
            icon={userLocationIcon}
            interactive={true}
          >
            <Popup>
              <div className="text-xs p-1 space-y-1">
                <div className="font-bold text-gray-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                  {location.isLiveTracking ? 'Live GPS Position' : 'Current Location'}
                </div>
                <div className="text-gray-600 font-mono">
                  {formatCoordinate(location.lat)}°, {formatCoordinate(location.lng)}°
                </div>
                <div className="text-[11px] text-gray-500">
                  Accuracy: <strong className="text-gray-700">±{location.accuracy.toFixed(1)} m</strong>
                </div>
                {location.speed != null && location.speed > 0 && (
                  <div className="text-[11px] text-gray-500">
                    Speed: {(location.speed * 3.6).toFixed(1)} km/h
                  </div>
                )}
                {location.altitude != null && (
                  <div className="text-[11px] text-gray-500">
                    Altitude: {location.altitude.toFixed(0)} m
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Land Polygon when >= 3 points */}
        {points.length >= 3 && (
          <Polygon
            positions={polygonPositions}
            pathOptions={{
              color: hasSelfIntersection ? '#ef4444' : '#16a34a',
              weight: 3,
              fillColor: hasSelfIntersection ? '#ef4444' : '#22c55e',
              fillOpacity: hasSelfIntersection ? 0.3 : 0.2,
            }}
          />
        )}

        {/* Connecting line when only 2 points */}
        {points.length === 2 && (
          <Polyline
            positions={polygonPositions}
            pathOptions={{
              color: '#16a34a',
              weight: 3,
              dashArray: '6, 6',
            }}
          />
        )}

        {/* Edge distance markers at midpoints */}
        {edges.map((edge) => (
          <Marker
            key={`edge-${edge.fromId}-${edge.toId}`}
            position={[edge.midLat, edge.midLng]}
            icon={createEdgeIcon(edge.distanceMeters)}
            interactive={false}
          />
        ))}

        {/* Draggable Vertex Markers */}
        {points.map((point) => (
          <VertexMarker
            key={point.id}
            point={point}
            isSelected={selectedPointId === point.id}
            isDraggable={mode !== 'result'}
            onSelect={onPointSelect}
            onDragStart={handleVertexDragStart}
            onDrag={handleVertexDrag}
            onDragEnd={handleVertexDragEnd}
          />
        ))}
      </MapContainer>
    </div>
  );
};
