import { useState, useCallback, useEffect } from 'react';
import { useLotteryResults } from './useLotteryResults';

export function useLiveDraw() {
  const [isDrawing, setIsDrawing] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const [numbers, setNumbers] = useState<number[]>([]);
  const [lastSeenDraw, setLastSeenDraw] = useState<string | null>(null);
  const { drawResults: results, isLoading } = useLotteryResults();

  // Charger le dernier tirage vu du localStorage
  useEffect(() => {
    const stored = localStorage.getItem('last-seen-draw');
    setLastSeenDraw(stored);
  }, []);

  // Vérifier s'il y a un nouveau tirage
  useEffect(() => {
    if (!isLoading && results.length > 0 && lastSeenDraw !== null) {
      const latestDraw = results[0];
      if (latestDraw.drawNumber !== lastSeenDraw) {
        setNumbers(latestDraw.numbers);
        setShouldShow(true);
        localStorage.setItem('last-seen-draw', latestDraw.drawNumber);
      }
    }
  }, [isLoading, results, lastSeenDraw]);

  const startDraw = useCallback((drawNumbers: number[]) => {
    setNumbers(drawNumbers);
    setIsDrawing(true);
    setShouldShow(true);
  }, []);

  const endDraw = useCallback(() => {
    setIsDrawing(false);
    setNumbers([]);
    setShouldShow(false);
  }, []);

  const onComplete = useCallback(() => {
    setShouldShow(false);
    setIsDrawing(false);
    setLastSeenDraw(null); // Réinitialiser pour permettre de relancer l'animation
  }, []);

  const showLiveDraw = useCallback(() => {
    if (results.length > 0) {
      setNumbers(results[0].numbers);
      setShouldShow(true);
      setLastSeenDraw(null); // Réinitialiser pour permettre de relancer l'animation
      setIsDrawing(false); // Réinitialiser l'état de dessin
    }
  }, [results]);

  return {
    isDrawing,
    shouldShow,
    numbers,
    startDraw,
    endDraw,
    onComplete,
    showLiveDraw
  };
} 