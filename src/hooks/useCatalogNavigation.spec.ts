import { invertly } from '@rolster/invertly';
import { act } from 'react';
import { renderHook } from '../testing';
import { CatalogNavigationStore } from '../stores/CatalogNavigationStore';
import { PaginationEvent } from '../types';
import { useCatalogNavigation } from './useCatalogNavigation';

const UUID = '3f2504e0-4f89-11d3-9a0c-0305e82c3301';

const store = invertly(CatalogNavigationStore);

function createContainer(): HTMLDivElement & {
  scrollTo: ReturnType<typeof vi.fn>;
} {
  const element = document.createElement('div');

  (element as any).scrollTo = vi.fn();

  return element as any;
}

function event<E>(
  currentPage: number,
  suggestions: E[],
  lastPage = false
): PaginationEvent<E> {
  return { currentPage, lastPage, suggestions };
}

function comeBackFromDetail(path: string): void {
  store.track(path);
  store.track(`${path}/${UUID}`);
  store.track(path);
}

describe('useCatalogNavigation', () => {
  beforeEach(() => {
    store.reset();
    window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as any;
  });

  it('should start without records nor position', () => {
    store.track('/products');

    const { result } = renderHook(() =>
      useCatalogNavigation<string>({
        pathname: '/products',
        onLastPage: () => {}
      })
    );

    expect(result.current.records).toEqual([]);
    expect(result.current.position).toBeUndefined();
  });

  it('should expose the records of each pagination event', () => {
    store.track('/products');

    const { result } = renderHook(() =>
      useCatalogNavigation<string>({
        pathname: '/products',
        onLastPage: () => {}
      })
    );

    act(() => result.current.onPagination(event(1, ['a', 'b'])));

    expect(result.current.records).toEqual(['a', 'b']);
  });

  it('should notify when the last page is reached', () => {
    store.track('/products');

    const onLastPage = vi.fn();

    const { result } = renderHook(() =>
      useCatalogNavigation<string>({ pathname: '/products', onLastPage })
    );

    act(() => result.current.onPagination(event(1, ['a'])));

    expect(onLastPage).not.toHaveBeenCalled();

    act(() => result.current.onPagination(event(2, ['b'], true)));

    expect(onLastPage).toHaveBeenCalledTimes(1);
  });

  it('should scroll to top when the page changes', () => {
    store.track('/products');

    const container = createContainer();

    const { result } = renderHook(() =>
      useCatalogNavigation<string>({
        pathname: '/products',
        onLastPage: () => {}
      })
    );

    (result.current.containerRef as any).current = container;

    act(() => result.current.onPagination(event(1, ['a'])));
    act(() => result.current.onPagination(event(1, ['a', 'b'])));
    act(() => result.current.onPagination(event(2, ['c'])));

    expect(container.scrollTo).toHaveBeenCalledTimes(2);
  });

  it('should remember keyword, page and scroll in the store', () => {
    store.track('/products');

    const container = createContainer();

    const { result } = renderHook(() =>
      useCatalogNavigation<string>({
        pathname: '/products',
        keyword: 'shirt',
        onLastPage: () => {}
      })
    );

    (result.current.containerRef as any).current = container;

    act(() => result.current.onPagination(event(2, ['a'])));

    container.scrollTop = 320;

    act(() => result.current.onScroll());

    comeBackFromDetail('/products');

    expect(store.restorable('/products')).toEqual({
      keyword: 'shirt',
      page: 2,
      scrollTop: 320
    });
  });

  it('should restore the page and scroll when coming back from a detail', () => {
    store.remember('/products', { keyword: 'shirt', page: 3, scrollTop: 480 });
    comeBackFromDetail('/products');

    const container = createContainer();

    const { result } = renderHook(() =>
      useCatalogNavigation<string>({
        pathname: '/products',
        keyword: 'shirt',
        onLastPage: () => {}
      })
    );

    (result.current.containerRef as any).current = container;

    expect(result.current.position).toBe(3);

    act(() => result.current.onPagination(event(3, ['a'])));

    expect(container.scrollTop).toBe(480);
  });

  it('should not restore the scroll when the keyword differs', () => {
    store.remember('/products', { keyword: 'shirt', page: 3, scrollTop: 480 });
    comeBackFromDetail('/products');

    const container = createContainer();

    const { result } = renderHook(() =>
      useCatalogNavigation<string>({
        pathname: '/products',
        keyword: 'pants',
        onLastPage: () => {}
      })
    );

    (result.current.containerRef as any).current = container;

    act(() => result.current.onPagination(event(3, ['a'])));

    expect(container.scrollTop).toBe(0);
  });

  it('should not restore when coming from a non detail route', () => {
    store.remember('/products', { keyword: '', page: 3, scrollTop: 480 });
    store.track('/products');
    store.track('/customers');
    store.track('/products');

    const { result } = renderHook(() =>
      useCatalogNavigation<string>({
        pathname: '/products',
        onLastPage: () => {}
      })
    );

    expect(result.current.position).toBeUndefined();
  });

  it('should always call the latest onLastPage callback', () => {
    store.track('/products');

    const first = vi.fn();
    const second = vi.fn();

    let onLastPage = first;

    const { rerender, result } = renderHook(() =>
      useCatalogNavigation<string>({ pathname: '/products', onLastPage })
    );

    onLastPage = second;
    rerender();

    act(() => result.current.onPagination(event(1, ['a'], true)));

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});
