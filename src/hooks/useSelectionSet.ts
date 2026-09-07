import { SelectionSet } from '@rolster/commons';
import { useCallback, useMemo, useState } from 'react';

export type SelectionEquals<T> = (a: T, b: T) => boolean;

export interface SelectionSetController<T> {
  clear: () => void;
  contains: (value: T) => boolean;
  containsAll: (values: T[]) => boolean;
  containsAny: (values: T[]) => boolean;
  isEmpty: boolean;
  refresh: (values: T[]) => void;
  selecteds: T[];
  size: number;
  toggle: (value: T) => void;
  toggleAll: (values: T[]) => void;
}

export function useSelectionSet<T>(
  initials: T[] = [],
  equals?: SelectionEquals<T>
): SelectionSetController<T> {
  const [selection, setSelection] = useState(
    () => new SelectionSet(initials, equals)
  );

  const toggle = useCallback((value: T) => {
    setSelection((selection) => selection.toggle(value));
  }, []);

  const toggleAll = useCallback((values: T[]) => {
    setSelection((selection) => selection.toggleAll(values));
  }, []);

  const refresh = useCallback((values: T[]) => {
    setSelection((selection) => selection.refresh(values));
  }, []);

  const clear = useCallback(() => {
    setSelection((selection) => selection.clear());
  }, []);

  return useMemo(
    () => ({
      clear,
      contains: (value: T) => selection.contains(value),
      containsAll: (values: T[]) => selection.containsAll(values),
      containsAny: (values: T[]) => selection.containsAny(values),
      isEmpty: selection.isEmpty,
      refresh,
      selecteds: selection.values,
      size: selection.size,
      toggle,
      toggleAll
    }),
    [clear, refresh, selection, toggle, toggleAll]
  );
}
