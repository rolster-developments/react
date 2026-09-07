import { act } from 'react';
import { renderHook } from '../testing';
import { PaginationEvent } from '../types';
import { usePaginationNavigation } from './usePaginationNavigation';

function createContainer(): HTMLDivElement & {
  scrollTo: ReturnType<typeof vi.fn>;
} {
  const element = document.createElement('div');

  (element as any).scrollTo = vi.fn();

  return element as any;
}

function event<E>(currentPage: number, suggestions: E[]): PaginationEvent<E> {
  return { currentPage, lastPage: false, suggestions };
}

describe('usePaginationNavigation', () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as any;
  });

  it('should forward the suggestions of each pagination event', () => {
    const onSuggestion = vi.fn();

    const { result } = renderHook(() =>
      usePaginationNavigation<string>(onSuggestion)
    );

    act(() => result.current.onPagination(event(1, ['a', 'b'])));

    expect(onSuggestion).toHaveBeenCalledWith(['a', 'b']);
  });

  it('should scroll the container to top when the page changes', () => {
    const container = createContainer();

    const { result } = renderHook(() =>
      usePaginationNavigation<string>(() => {})
    );

    (result.current.containerRef as any).current = container;

    act(() => result.current.onPagination(event(1, ['a'])));
    act(() => result.current.onPagination(event(2, ['b'])));

    expect(container.scrollTo).toHaveBeenCalledTimes(2);
    expect(container.scrollTo).toHaveBeenLastCalledWith({
      behavior: 'smooth',
      top: 0
    });
  });

  it('should not scroll when the page stays the same', () => {
    const container = createContainer();

    const { result } = renderHook(() =>
      usePaginationNavigation<string>(() => {})
    );

    (result.current.containerRef as any).current = container;

    act(() => result.current.onPagination(event(1, ['a'])));
    act(() => result.current.onPagination(event(1, ['a', 'b'])));

    expect(container.scrollTo).toHaveBeenCalledTimes(1);
  });

  it('should always call the latest onSuggestion callback', () => {
    const first = vi.fn();
    const second = vi.fn();

    let onSuggestion = first;

    const { rerender, result } = renderHook(() =>
      usePaginationNavigation<string>(onSuggestion)
    );

    onSuggestion = second;
    rerender();

    act(() => result.current.onPagination(event(1, ['a'])));

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith(['a']);
  });

  it('should keep onPagination stable between renders', () => {
    const { rerender, result } = renderHook(() =>
      usePaginationNavigation<string>(() => {})
    );

    const { onPagination } = result.current;

    rerender();

    expect(result.current.onPagination).toBe(onPagination);
  });
});
