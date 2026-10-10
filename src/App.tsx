import { useState, useEffect, useCallback } from 'react';
import { TopBar } from './components/TopBar';
import { NavigationSidebar } from './components/NavigationSidebar';
import { MapView } from './components/MapView';
import { MapControls } from './components/MapControls';
import { LiveLocationBar } from './components/LiveLocationBar';
import { MeasurementPanel } from './components/MeasurementPanel';
import { MobileBottomSheet } from './components/MobileBottomSheet';
import { InitialCard } from './components/InitialCard';
import { CoordinatePopup } from './components/CoordinatePopup';
import { ClearConfirmationModal } from './components/ClearConfirmationModal';
import { AccuracyInfoModal } from './components/AccuracyInfoModal';
import { MeasurementResult } from './components/MeasurementResult';
import { ExportModal } from './components/ExportModal';
import { ToastContainer } from './components/Toast';
import type { ToastMessage } from './components/Toast';

import { useGeolocation } from './hooks/useGeolocation';
import { useMeasurement } from './hooks/useMeasurement';
import type { MapLayerType } from './types/measurement';

export function App() {
  const [layer, setLayer] = useState<MapLayerType>('satellite');
  const [activeNavTab, setActiveNavTab] = useState<'measure' | 'export' | 'help'>('measure');
  const [isAccuracyInfoOpen, setIsAccuracyInfoOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Geolocation hook with continuous live tracking support
  const {
    location,
    isLocating,
    errorMessage: locationError,
    followUser,
    setFollowUser,
    requestLocation,
    toggleLiveTracking,
    clearError: clearLocationError,
  } = useGeolocation();

  // Measurement management hook
  const {
    points,
    result,
    mode,
    unit,
    selectedPoint,
    selectedPointId,
    isConfirmingClear,
    canUndo,
    canRedo,
    setUnit,
    setSelectedPointId,
    setIsConfirmingClear,
    startMeasuring,
    addPoint,
    updatePoint,
    deletePoint,
    undo,
    redo,
    clearMeasurement,
    finishMeasurement,
    resumeMeasuring,
  } = useMeasurement();

  // Toast dispatch helper
  const addToast = useCallback(
    (type: ToastMessage['type'], message: string, title?: string) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      setToasts((prev) => [...prev, { id, type, message, title }]);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync geolocation errors with toast system
  useEffect(() => {
    if (locationError) {
      addToast('error', locationError, 'Location Service');
      clearLocationError();
    }
  }, [locationError, addToast, clearLocationError]);

  // Keyboard shortcut support: Undo (Ctrl+Z), Redo (Ctrl+Y / Ctrl+Shift+Z), Escape (close modal)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          if (canRedo) redo();
        } else {
          if (canUndo) undo();
        }
        e.preventDefault();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        if (canRedo) redo();
        e.preventDefault();
      } else if (e.key === 'Escape') {
        setSelectedPointId(null);
        setIsConfirmingClear(false);
        setIsAccuracyInfoOpen(false);
        setIsExportModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo, setSelectedPointId, setIsConfirmingClear]);

  // Handle map click
  const handleMapClick = (lat: number, lng: number) => {
    if (mode === 'idle') {
      startMeasuring();
    }
    addPoint(lat, lng);
  };

  // Add boundary point at current GPS location (corner stamping)
  const handleAddPointAtMyLocation = useCallback(() => {
    if (location.active) {
      if (mode === 'idle') {
        startMeasuring();
      }
      addPoint(location.lat, location.lng);
      addToast(
        'success',
        `Corner added at GPS location (${location.lat.toFixed(6)}°, ${location.lng.toFixed(6)}° • ±${location.accuracy.toFixed(1)}m)`,
        'Corner Marked'
      );
    } else {
      addToast('info', 'Acquiring GPS location lock...', 'GPS');
      requestLocation();
    }
  }, [location.active, location.lat, location.lng, location.accuracy, mode, startMeasuring, addPoint, addToast, requestLocation]);

  // Toggle map layers
  const handleToggleLayer = () => {
    setLayer((prev) => (prev === 'satellite' ? 'street' : 'satellite'));
  };

  // Handle navigation tab clicks
  const handleSelectNavTab = (tab: 'measure' | 'export' | 'help') => {
    setActiveNavTab(tab);
    if (tab === 'export') {
      setIsExportModalOpen(true);
    } else if (tab === 'help') {
      setIsAccuracyInfoOpen(true);
    }
  };

  // Toggle fullscreen
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Map zoom programmatic handlers
  const handleZoomIn = () => {
    const zoomInBtn = document.querySelector('.leaflet-control-zoom-in') as HTMLElement;
    if (zoomInBtn) {
      zoomInBtn.click();
    } else {
      window.dispatchEvent(new CustomEvent('map:zoom-in'));
    }
  };

  const handleZoomOut = () => {
    const zoomOutBtn = document.querySelector('.leaflet-control-zoom-out') as HTMLElement;
    if (zoomOutBtn) {
      zoomOutBtn.click();
    } else {
      window.dispatchEvent(new CustomEvent('map:zoom-out'));
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-50 text-gray-900 select-none">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Top Application Bar with Live GPS toggle */}
      <TopBar
        layer={layer}
        isLiveTracking={location.isLiveTracking}
        isLocating={isLocating}
        onToggleLayer={handleToggleLayer}
        onToggleLiveTracking={toggleLiveTracking}
        onOpenAccuracyInfo={() => setIsAccuracyInfoOpen(true)}
      />

      {/* Main App Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Navigation Sidebar (Desktop) */}
        <NavigationSidebar
          activeTab={activeNavTab}
          hasPoints={points.length > 0}
          canUndo={canUndo}
          canRedo={canRedo}
          onSelectTab={handleSelectNavTab}
          onUndo={undo}
          onRedo={redo}
          onClear={() => setIsConfirmingClear(true)}
          onOpenHelp={() => setIsAccuracyInfoOpen(true)}
        />

        {/* Central Interactive Map Container */}
        <main className="flex-1 relative h-full w-full overflow-hidden">
          <MapView
            points={points}
            edges={result.edges}
            layer={layer}
            location={location}
            selectedPointId={selectedPointId}
            mode={mode}
            hasSelfIntersection={result.hasSelfIntersection}
            followUser={followUser}
            onUserPan={() => setFollowUser(false)}
            onMapClick={handleMapClick}
            onPointDrag={updatePoint}
            onPointSelect={setSelectedPointId}
          />

          {/* Live GPS Telemetry Status Floating Bar */}
          <LiveLocationBar
            location={location}
            isLocating={isLocating}
            followUser={followUser}
            onToggleFollow={() => setFollowUser(!followUser)}
            onToggleLiveTracking={toggleLiveTracking}
            onAddPointAtMyLocation={handleAddPointAtMyLocation}
          />

          {/* Floating Map Controls (Live GPS, Layers, Zoom, Fullscreen) */}
          <MapControls
            layer={layer}
            isLiveTracking={location.isLiveTracking}
            isLocating={isLocating}
            followUser={followUser}
            onToggleLayer={handleToggleLayer}
            onToggleLiveTracking={toggleLiveTracking}
            onToggleFollowUser={() => setFollowUser(!followUser)}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            isFullscreen={isFullscreen}
            onToggleFullscreen={handleToggleFullscreen}
          />

          {/* Initial Welcome & Start Guidance Card */}
          {mode === 'idle' && points.length === 0 && (
            <InitialCard
              onStartMeasuring={startMeasuring}
              onRequestLocation={toggleLiveTracking}
              isLocating={isLocating}
            />
          )}

          {/* Selected Point Information Popup */}
          {selectedPoint && (
            <CoordinatePopup
              point={selectedPoint}
              totalPoints={points.length}
              onClose={() => setSelectedPointId(null)}
              onDelete={deletePoint}
            />
          )}

          {/* Mobile Bottom Sheet (shown on smaller viewports) */}
          {mode !== 'idle' && (
            <MobileBottomSheet
              points={points}
              result={result}
              unit={unit}
              canUndo={canUndo}
              canRedo={canRedo}
              isLiveTracking={location.isLiveTracking}
              onAddPointAtLocation={handleAddPointAtMyLocation}
              onSelectUnit={setUnit}
              onUndo={undo}
              onRedo={redo}
              onClear={() => setIsConfirmingClear(true)}
              onFinish={finishMeasurement}
              onOpenAccuracyInfo={() => setIsAccuracyInfoOpen(true)}
            />
          )}
        </main>

        {/* Right Measurement Panel (Desktop) */}
        {mode !== 'idle' && (
          <div className="hidden md:block h-full">
            <MeasurementPanel
              points={points}
              result={result}
              unit={unit}
              canUndo={canUndo}
              canRedo={canRedo}
              selectedPointId={selectedPointId}
              isLocationActive={location.active}
              isLiveTracking={location.isLiveTracking}
              onAddPointAtLocation={handleAddPointAtMyLocation}
              onSelectUnit={setUnit}
              onUndo={undo}
              onRedo={redo}
              onClear={() => setIsConfirmingClear(true)}
              onFinish={finishMeasurement}
              onSelectPoint={setSelectedPointId}
              onDeletePoint={deletePoint}
              onOpenAccuracyInfo={() => setIsAccuracyInfoOpen(true)}
            />
          </div>
        )}
      </div>

      {/* Finished Measurement Result Full Screen View */}
      {mode === 'result' && (
        <MeasurementResult
          points={points}
          result={result}
          unit={unit}
          layer={layer}
          onSelectUnit={setUnit}
          onResumeEditing={resumeMeasuring}
          onNewMeasurement={() => setIsConfirmingClear(true)}
          onOpenAccuracyInfo={() => setIsAccuracyInfoOpen(true)}
        />
      )}

      {/* Confirmation Modal for Clearing Measurement */}
      <ClearConfirmationModal
        isOpen={isConfirmingClear}
        onCancel={() => setIsConfirmingClear(false)}
        onConfirm={clearMeasurement}
      />

      {/* Accuracy & Mathematical Methodology Modal */}
      <AccuracyInfoModal
        isOpen={isAccuracyInfoOpen}
        onClose={() => setIsAccuracyInfoOpen(false)}
      />

      {/* Export Dialog Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        points={points}
        result={result}
        layer={layer}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}

export default App;
