import { act } from 'react';
import { renderHook } from '../testing';
import { useElapsedTime } from './useElapsedTime';

const NOW = new Date('2026-09-07T10:00:00.000Z');

function minutesAgo(minutes: number): Date {
  return new Date(NOW.getTime() - minutes * 60000);
}

describe('useElapsedTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should calculate the elapsed time from the given date', () => {
    const { result } = renderHook(() => useElapsedTime(minutesAgo(75)));

    expect(result.current.minutes).toBe(75);
    expect(result.current.chronometer).toBe('01:15');
    expect(result.current.timestamp).toBe(75 * 60000);
  });

  it('should pad hours and minutes with two digits', () => {
    const { result } = renderHook(() => useElapsedTime(minutesAgo(5)));

    expect(result.current.chronometer).toBe('00:05');
  });

  it('should refresh every minute by default', () => {
    const { result } = renderHook(() => useElapsedTime(minutesAgo(1)));

    expect(result.current.minutes).toBe(1);

    act(() => {
      vi.advanceTimersByTime(60000);
    });

    expect(result.current.minutes).toBe(2);
    expect(result.current.chronometer).toBe('00:02');
  });

  it('should honor a custom refresh interval', () => {
    const { result } = renderHook(() => useElapsedTime(minutesAgo(0), 1000));

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.timestamp).toBe(3000);
  });

  it('should recalculate when the date changes', () => {
    let dateAt = minutesAgo(10);

    const { rerender, result } = renderHook(() => useElapsedTime(dateAt));

    expect(result.current.minutes).toBe(10);

    dateAt = minutesAgo(30);
    rerender();

    expect(result.current.minutes).toBe(30);
  });

  it('should clear the interval on unmount', () => {
    const clearSpy = vi.spyOn(globalThis, 'clearInterval');

    const { unmount } = renderHook(() => useElapsedTime(minutesAgo(1)));

    unmount();

    expect(clearSpy).toHaveBeenCalledTimes(1);

    clearSpy.mockRestore();
  });
});
