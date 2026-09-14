import { freeze } from '@rolster/commons';
import { useCallback, useMemo, useState } from 'react';

export type StoreReducer<T> = (state: Readonly<T>) => T;
export type StoreSelector<T, V> = (state: Readonly<T>) => V;

export interface ReactStore<T extends LiteralObject> {
  reduce: (reducer: StoreReducer<T>) => void;
  reset: () => void;
  select: <V>(selector: StoreSelector<T, V>) => V;
  setValue: (value: Partial<T>) => void;
  value: Readonly<T>;
}

export function useStore<T extends LiteralObject>(initial: T): ReactStore<T> {
  const [initialState] = useState<Readonly<T>>(() => freeze(initial));
  const [value, setState] = useState<Readonly<T>>(initialState);

  const reduce = useCallback((reducer: StoreReducer<T>) => {
    setState((state) => freeze(reducer(state)));
  }, []);

  const setValue = useCallback(
    (partial: Partial<T>) => {
      reduce((state) => ({ ...state, ...partial }));
    },
    [reduce]
  );

  const reset = useCallback(() => {
    setState(initialState);
  }, [initialState]);

  const select = useCallback(
    <V>(selector: StoreSelector<T, V>) => selector(value),
    [value]
  );

  return useMemo(
    () => ({ reduce, reset, select, setValue, value }),
    [reduce, reset, select, setValue, value]
  );
}
