import { act } from 'react';
import { renderHook } from '../testing';
import { useSelectionSet } from './useSelectionSet';

interface Item {
  id: string;
  name: string;
}

const equalsById = (a: Item, b: Item) => a.id === b.id;

const alpha: Item = { id: '1', name: 'alpha' };
const beta: Item = { id: '2', name: 'beta' };
const gamma: Item = { id: '3', name: 'gamma' };

describe('useSelectionSet', () => {
  it('should start empty by default', () => {
    const { result } = renderHook(() => useSelectionSet<Item>());

    expect(result.current.selecteds).toEqual([]);
    expect(result.current.isEmpty).toBe(true);
    expect(result.current.size).toBe(0);
  });

  it('should start with the initial values', () => {
    const { result } = renderHook(() => useSelectionSet([alpha, beta]));

    expect(result.current.selecteds).toEqual([alpha, beta]);
    expect(result.current.size).toBe(2);
  });

  it('should toggle a value in and out', () => {
    const { result } = renderHook(() => useSelectionSet<Item>());

    act(() => result.current.toggle(alpha));

    expect(result.current.contains(alpha)).toBe(true);

    act(() => result.current.toggle(alpha));

    expect(result.current.contains(alpha)).toBe(false);
  });

  it('should use the custom equality to match values', () => {
    const { result } = renderHook(() => useSelectionSet<Item>([], equalsById));

    act(() => result.current.toggle(alpha));

    expect(result.current.contains({ id: '1', name: 'other' })).toBe(true);
    expect(result.current.containsAny([beta, { id: '1', name: 'x' }])).toBe(
      true
    );
  });

  it('should select all missing values and unselect them when all are selected', () => {
    const { result } = renderHook(() => useSelectionSet([alpha], equalsById));

    act(() => result.current.toggleAll([alpha, beta, gamma]));

    expect(result.current.containsAll([alpha, beta, gamma])).toBe(true);

    act(() => result.current.toggleAll([alpha, beta, gamma]));

    expect(result.current.isEmpty).toBe(true);
  });

  it('should prune the selection against the refreshed values', () => {
    const { result } = renderHook(() =>
      useSelectionSet([alpha, beta], equalsById)
    );

    act(() => result.current.refresh([beta, gamma]));

    expect(result.current.selecteds).toEqual([beta]);
  });

  it('should clear the selection', () => {
    const { result } = renderHook(() => useSelectionSet([alpha, beta]));

    act(() => result.current.clear());

    expect(result.current.isEmpty).toBe(true);
  });

  it('should keep action callbacks stable between renders', () => {
    const { rerender, result } = renderHook(() => useSelectionSet<Item>());

    const { clear, refresh, toggle, toggleAll } = result.current;

    act(() => result.current.toggle(alpha));
    rerender();

    expect(result.current.toggle).toBe(toggle);
    expect(result.current.toggleAll).toBe(toggleAll);
    expect(result.current.refresh).toBe(refresh);
    expect(result.current.clear).toBe(clear);
  });
});
