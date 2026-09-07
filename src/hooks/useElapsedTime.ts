import { Miliseconds } from '@rolster/dates';
import { useEffect, useState } from 'react';

export interface ElapsedTime {
  chronometer: string;
  minutes: number;
  timestamp: number;
}

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
  interval: number = Miliseconds.Minute
): ElapsedTime {
  const [state, setState] = useState(() => calculateElapsedTime(dateAt));

  const dateTime = dateAt.getTime();

  useEffect(() => {
    setState(calculateElapsedTime(dateAt));

    const intervalId = setInterval(() => {
      setState(calculateElapsedTime(dateAt));
    }, interval);

    return () => {
      clearInterval(intervalId);
    };
  }, [dateTime, interval]);

  return state;
}
