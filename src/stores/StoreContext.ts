import {
  createContext,
  createElement,
  ReactElement,
  ReactNode,
  useContext
} from 'react';
import { ReactStore, useStore } from '../hooks/useStore';

export interface StoreProviderProps<T extends LiteralObject> {
  children?: ReactNode;
  initial?: T;
}

export interface StoreContext<T extends LiteralObject> {
  StoreProvider: (props: StoreProviderProps<T>) => ReactElement;
  useStoreContext: () => ReactStore<T>;
}

export function createStoreContext<T extends LiteralObject>(
  initial: T
): StoreContext<T> {
  const Context = createContext<Undefined<ReactStore<T>>>(undefined);

  function StoreProvider(props: StoreProviderProps<T>): ReactElement {
    const store = useStore<T>(props.initial ?? initial);

    return createElement(Context.Provider, { value: store }, props.children);
  }

  function useStoreContext(): ReactStore<T> {
    const store = useContext(Context);

    if (!store) {
      throw new Error('useStoreContext must be used within its StoreProvider');
    }

    return store;
  }

  return { StoreProvider, useStoreContext };
}
