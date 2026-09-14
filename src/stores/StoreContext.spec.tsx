import { act } from 'react';
import { ReactStore } from '../hooks/useStore';
import { renderHook, renderTree } from '../testing';
import { createStoreContext } from './StoreContext';

interface CounterState {
  count: number;
  step: number;
}

const { StoreProvider, useStoreContext } = createStoreContext<CounterState>({
  count: 0,
  step: 1
});

describe('createStoreContext', () => {
  it('should share the same store between components under the provider', () => {
    let writer!: ReactStore<CounterState>;
    let reader!: ReactStore<CounterState>;

    function Writer() {
      writer = useStoreContext();

      return null;
    }

    function Reader() {
      reader = useStoreContext();

      return null;
    }

    renderTree(
      <StoreProvider>
        <Writer />
        <Reader />
      </StoreProvider>
    );

    expect(reader.value).toEqual({ count: 0, step: 1 });

    act(() => {
      writer.setValue({ count: 3 });
    });

    expect(reader.value).toEqual({ count: 3, step: 1 });
    expect(reader).toBe(writer);
  });

  it('should use the initial value given to the provider', () => {
    let store!: ReactStore<CounterState>;

    function Consumer() {
      store = useStoreContext();

      return null;
    }

    renderTree(
      <StoreProvider initial={{ count: 10, step: 2 }}>
        <Consumer />
      </StoreProvider>
    );

    expect(store.value).toEqual({ count: 10, step: 2 });
  });

  it('should isolate the state of different providers', () => {
    let first!: ReactStore<CounterState>;
    let second!: ReactStore<CounterState>;

    function First() {
      first = useStoreContext();

      return null;
    }

    function Second() {
      second = useStoreContext();

      return null;
    }

    renderTree(
      <>
        <StoreProvider>
          <First />
        </StoreProvider>
        <StoreProvider>
          <Second />
        </StoreProvider>
      </>
    );

    act(() => {
      first.setValue({ count: 8 });
    });

    expect(first.value.count).toBe(8);
    expect(second.value.count).toBe(0);
  });

  it('should throw when used outside of the provider', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() => renderHook(() => useStoreContext())).toThrow(
      'useStoreContext must be used within its StoreProvider'
    );

    consoleError.mockRestore();
  });
});
