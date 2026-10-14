import { Miliseconds } from '@rolster/dates';
import { useEffect, useRef, useState } from 'react';

export interface ElapsedTime {
  chronometer: string;
  minutes: number;
  timestamp: number;
}

export type ElapsedTimeUntil = (time: ElapsedTime) => boolean;

function chronometerFormat(minutes: number): string {
  const hours = String(Math.floor(minutes / 60)).padStart(2, '0');
  const rest = String(minutes % 60).padStart(2, '0');

  return `${hours}:${rest}`;
}

export function calculateElapsedTime(dateAt: Date): ElapsedTime {
  const timestamp = Date.now() - dateAt.getTime();
  const minutes = Math.round(timestamp / Miliseconds.Minute);

  return {
    chronometer: chronometerFormat(minutes),
    minutes,
    timestamp
  };
}

export function useElapsedTime(
  dateAt: Date,
  interval: number = Miliseconds.Minute,
  until?: ElapsedTimeUntil
): ElapsedTime {
  const [state, setState] = useState(() => calculateElapsedTime(dateAt));

  const untilRef = useRef(until);

  untilRef.current = until;

  const dateTime = dateAt.getTime();

  useEffect(() => {
    const initial = calculateElapsedTime(dateAt);

    setState(initial);

    if (untilRef.current?.(initial)) {
      return;
    }

    const intervalId = setInterval(() => {
      const current = calculateElapsedTime(dateAt);

      setState(current);

      if (untilRef.current?.(current)) {
        clearInterval(intervalId);
      }
    }, interval);

    return () => {
      clearInterval(intervalId);
    };
  }, [dateTime, interval]);

  return state;
}
