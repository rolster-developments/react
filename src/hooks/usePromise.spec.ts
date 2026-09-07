import { act } from 'react';
import { renderHook } from '../testing';
import { usePromise } from './usePromise';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;

  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });

  return { promise, reject, resolve };
}

async function flush(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
  });
}

describe('usePromise', () => {
  it('should start with an empty state', () => {
    const { result } = renderHook(() => usePromise(() => Promise.resolve(1)));

    expect(result.current.isEmpty()).toBe(true);
  });

  it('should expose the resolved value', async () => {
    const { promise, resolve } = deferred<string>();

    const { result } = renderHook(() => usePromise(() => promise));

    await act(async () => {
      resolve('rolster');
      await promise;
    });

    expect(result.current.isPresent()).toBe(true);
    expect(result.current.get()).toEqual({ value: 'rolster' });
  });

  it('should expose the rejection error', async () => {
    const { promise, reject } = deferred<string>();
    const error = new Error('failure');

    const { result } = renderHook(() => usePromise(() => promise));

    await act(async () => {
      reject(error);
      await promise.catch(() => {});
    });

    expect(result.current.isPresent()).toBe(true);
    expect(result.current.get()).toEqual({ error });
  });

  it('should ignore the result when unmounted before resolving', async () => {
    const { promise, resolve } = deferred<string>();

    const { result, unmount } = renderHook(() => usePromise(() => promise));

    unmount();

    await act(async () => {
      resolve('rolster');
      await promise;
    });

    expect(result.current.isEmpty()).toBe(true);
  });

  it('should run the factory only once without dependencies', async () => {
    const factory = vi.fn(() => Promise.resolve(1));

    const { rerender } = renderHook(() => usePromise(factory));

    await flush();
    rerender();
    await flush();

    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('should run the factory again when dependencies change', async () => {
    let dependency = 'a';

    const factory = vi.fn(() => Promise.resolve(dependency));

    const { rerender, result } = renderHook(() =>
      usePromise(factory, [dependency])
    );

    await flush();

    expect(result.current.get()).toEqual({ value: 'a' });

    dependency = 'b';
    rerender();

    expect(result.current.isEmpty()).toBe(true);

    await flush();

    expect(factory).toHaveBeenCalledTimes(2);
    expect(result.current.get()).toEqual({ value: 'b' });
  });
});
