
import { useState, useEffect, useRef, useCallback } from 'react';
import { SessionMode, SessionConfig } from '../types';

export const useSessionTimer = (
  isActive: boolean,
  mode: SessionMode,
  config: SessionConfig,
  initialDuration?: number, // Optional override (minutes)
  onComplete?: () => void,
  onSessionComplete?: (mode: SessionMode, durationMinutes: number) => void // NEW: Callback to handle session completion
) => {
  // Extract minutes from string (e.g., "20-40 min") or default to 20
  const parseDuration = useCallback((str: string) => {
    const match = str.match(/(\d+)/);
    return match ? parseInt(match[0], 10) * 60 : 20 * 60;
  }, []);

  const getStartTime = useCallback(() => {
    if (initialDuration) return initialDuration * 60;
    return parseDuration(config.recommendedDuration);
  }, [config.recommendedDuration, initialDuration, parseDuration]);

  const [totalTime, setTotalTime] = useState(getStartTime());
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [progress, setProgress] = useState(0);

  // Ref to track if we already triggered complete for this second
  const completedRef = useRef(false);

  // Reset timer when config changes significantly (not when just pausing)
  useEffect(() => {
    const newDuration = getStartTime();
    setTotalTime(newDuration);
    setTimeLeft(newDuration);
    setProgress(0);
    completedRef.current = false;
  }, [getStartTime]);

  // Countdown Logic
  useEffect(() => {
    let interval: number;

    if (isActive && timeLeft > 0) {
      completedRef.current = false; // Reset complete trigger if active and time remains
      interval = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            return 0;
          }
          const newTime = prev - 1;
          const newProgress = ((totalTime - newTime) / totalTime) * 100;
          setProgress(newProgress);
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0 && isActive && !completedRef.current) {
      // Completed Logic
      completedRef.current = true; // Prevent double trigger

      // Call the session complete callback if it's a meaningful session (> 1 min)
      if (totalTime > 60 && onSessionComplete) {
        const durationMin = totalTime / 60;
        onSessionComplete(mode, durationMin);
      }

      if (onComplete) onComplete();
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, totalTime, mode, onComplete, onSessionComplete]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const addTime = (minutes: number) => {
    setTotalTime(prev => prev + (minutes * 60));
    setTimeLeft(prev => prev + (minutes * 60));
    completedRef.current = false;
  };

  const setDuration = (minutes: number) => {
    const seconds = minutes * 60;
    setTotalTime(seconds);
    setTimeLeft(seconds);
    setProgress(0);
    completedRef.current = false;
  };

  return { timeLeft, totalTime, progress, formatTime, addTime, setDuration };
};
