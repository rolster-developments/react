import { RefObject, useCallback, useEffect, useRef } from 'react';
import { scrollToPosition } from '../helpers/scroll';
import { PaginationEvent } from '../types';

export interface PaginationNavigation<E> {
  containerRef: RefObject<HTMLDivElement | null>;
  onPagination: (pagination: PaginationEvent<E>) => void;
}

export function usePaginationNavigation<E>(
  onSuggestion: (suggestions: E[]) => void
): PaginationNavigation<E> {
  const containerRef = useRef<HTMLDivElement>(null);
  const onSuggestionRef = useRef(onSuggestion);
  const pageRef = useRef(0);

  useEffect(() => {
    onSuggestionRef.current = onSuggestion;
  }, [onSuggestion]);

  const onPagination = useCallback((pagination: PaginationEvent<E>) => {
    if (pagination.currentPage !== pageRef.current) {
      pageRef.current = pagination.currentPage;
      scrollToPosition(containerRef.current);
    }

    onSuggestionRef.current(pagination.suggestions);
  }, []);

  return { containerRef, onPagination };
}
