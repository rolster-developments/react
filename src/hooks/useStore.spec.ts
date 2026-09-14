import { act } from 'react';
import { renderHook } from '../testing';
import { useStore } from './useStore';

interface CounterState {
  count: number;
  step: number;
}

const initial: CounterState = { count: 0, step: 1 };

describe('useStore', () => {
  it('should expose the initial state as value', () => {
    const { result } = renderHook(() => useStore(initial));

    expect(result.current.value).toEqual({ count: 0, step: 1 });
  });
  it('should merge partial values with setValue and re-render', () => {
    const { result } = renderHook(() => useStore(initial));

    act(() => {
      result.current.setValue({ count: 5 });
    });

    expect(result.current.value).toEqual({ count: 5, step: 1 });
  });
  it('should replace the state with the reducer result', () => {
    const { result } = renderHook(() => useStore(initial));

    act(() => {
      result.current.reduce((state) => ({
        count: state.count + state.step,
        step: state.step * 2
      }));
    });

    expect(result.current.value).toEqual({ count: 1, step: 2 });
  });

  it('should return the derived value with select', () => {
    const { result } = renderHook(() => useStore(initial));

    act(() => {
      result.current.setValue({ count: 4 });
    });

    expect(result.current.select((state) => state.count * state.step)).toBe(4);
  });

  it('should restore the initial state with reset', () => {
    const { result } = renderHook(() => useStore(initial));

    act(() => {
      result.current.setValue({ count: 9, step: 3 });
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.value).toEqual({ count: 0, step: 1 });
  });
  it('should keep the state frozen', () => {
    const { result } = renderHook(() => useStore({ ...initial, tags: ['a'] }));

    expect(Object.isFrozen(result.current.value)).toBe(true);
    expect(Object.isFrozen(result.current.value.tags)).toBe(true);

    act(() => {
      result.current.setValue({ count: 2 });
    });

    expect(Object.isFrozen(result.current.value)).toBe(true);
  });

  it('should keep the same store identity while the state does not change', () => {
    const { result, rerender } = renderHook(() => useStore(initial));

    const first = result.current;

    rerender();

    expect(result.current).toBe(first);

    act(() => {
      result.current.setValue({ count: 1 });
    });

    expect(result.current).not.toBe(first);
    expect(result.current.setValue).toBe(first.setValue);
    expect(result.current.reduce).toBe(first.reduce);
    expect(result.current.reset).toBe(first.reset);
  });

  it('should reset to the initial state of the first render', () => {
    let current: CounterState = { count: 0, step: 1 };

    const { result, rerender } = renderHook(() => useStore(current));

    current = { count: 50, step: 5 };
    rerender();

    act(() => {
      result.current.setValue({ count: 7 });
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.value).toEqual({ count: 0, step: 1 });
  });
});
