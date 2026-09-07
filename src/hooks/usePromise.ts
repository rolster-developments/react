import { Optional } from '@rolster/commons';
import { DependencyList, useEffect, useState } from 'react';

export interface PromiseValue<T> {
  error?: unknown;
  value?: T;
}

export type PromiseState<T> = Optional<PromiseValue<T>>;

export function usePromise<T>(
  factory: () => Promise<T>,
  deps: DependencyList = []
): PromiseState<T> {
  const [state, setState] = useState<PromiseState<T>>(() => Optional.empty());

  useEffect(() => {
    let cancelled = false;

    setState(Optional.empty());

    factory()
      .then((value) => {
        if (!cancelled) {
          setState(Optional.build({ value }));
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setState(Optional.build({ error }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, deps);

  return state;
}
