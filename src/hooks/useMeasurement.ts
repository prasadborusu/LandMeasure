import { useState, useCallback, useMemo } from 'react';
import type { LatLngPoint, AreaUnit, AppMode, MeasurementResultData } from '../types/measurement';
import { computeLandMeasurement } from '../services/areaCalculator';

export function useMeasurement() {
  const [points, setPoints] = useState<LatLngPoint[]>([]);
  // History stack for undo / redo
  const [history, setHistory] = useState<LatLngPoint[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [unit, setUnit] = useState<AreaUnit>('acres');
  const [mode, setMode] = useState<AppMode>('idle');
  const [isConfirmingClear, setIsConfirmingClear] = useState<boolean>(false);

  // Compute live measurement data whenever points change
  const result: MeasurementResultData = useMemo(() => {
    return computeLandMeasurement(points);
  }, [points]);

  // Helper to commit new points array to history
  const commitPoints = useCallback(
    (newPoints: LatLngPoint[]) => {
      // Re-index orders cleanly
      const normalized = newPoints.map((p, idx) => ({
        ...p,
        order: idx + 1,
      }));

      setPoints(normalized);
      setHistory((prev) => {
        const nextHist = prev.slice(0, historyIndex + 1);
        nextHist.push(normalized);
        return nextHist;
      });
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex]
  );

  const startMeasuring = useCallback(() => {
    setMode('measuring');
  }, []);

  const addPoint = useCallback(
    (lat: number, lng: number) => {
      const newPt: LatLngPoint = {
        id: `pt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        lat,
        lng,
        order: points.length + 1,
      };
      commitPoints([...points, newPt]);
    },
    [points, commitPoints]
  );

  const updatePoint = useCallback(
    (id: string, lat: number, lng: number, saveToHistory: boolean = true) => {
      setPoints((prev) => {
        const updated = prev.map((p) => (p.id === id ? { ...p, lat, lng } : p));
        if (saveToHistory) {
          const normalized = updated.map((p, idx) => ({ ...p, order: idx + 1 }));
          setHistory((h) => {
            const nextHist = h.slice(0, historyIndex + 1);
            nextHist.push(normalized);
            return nextHist;
          });
          setHistoryIndex((idx) => idx + 1);
          return normalized;
        }
        return updated;
      });
    },
    [historyIndex]
  );

  const deletePoint = useCallback(
    (id: string) => {
      const remaining = points.filter((p) => p.id !== id);
      commitPoints(remaining);
      if (selectedPointId === id) {
        setSelectedPointId(null);
      }
    },
    [points, selectedPointId, commitPoints]
  );

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const nextIdx = historyIndex - 1;
      setHistoryIndex(nextIdx);
      setPoints(history[nextIdx]);
      setSelectedPointId(null);
    }
  }, [historyIndex, history]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setPoints(history[nextIdx]);
      setSelectedPointId(null);
    }
  }, [historyIndex, history]);

  const clearMeasurement = useCallback(() => {
    setPoints([]);
    setHistory([[]]);
    setHistoryIndex(0);
    setSelectedPointId(null);
    setMode('idle');
    setIsConfirmingClear(false);
  }, []);

  const finishMeasurement = useCallback(() => {
    if (points.length >= 3) {
      setMode('result');
    }
  }, [points.length]);

  const resumeMeasuring = useCallback(() => {
    setMode('measuring');
  }, []);

  const selectedPoint = useMemo(() => {
    return points.find((p) => p.id === selectedPointId) || null;
  }, [points, selectedPointId]);

  return {
    points,
    result,
    mode,
    unit,
    selectedPoint,
    selectedPointId,
    isConfirmingClear,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
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
  };
}
