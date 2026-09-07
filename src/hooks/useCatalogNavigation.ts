import { invertly } from '@rolster/invertly';
import {
  RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { scrollToPosition } from '../helpers/scroll';
import {
  CatalogNavigationState,
  CatalogNavigationStore
} from '../stores/CatalogNavigationStore';
import { PaginationEvent } from '../types';

export interface CatalogNavigation<E> {
  containerRef: RefObject<HTMLDivElement | null>;
  onPagination: (pagination: PaginationEvent<E>) => void;
  onScroll: () => void;
  records: E[];
  position?: number;
}

export interface CatalogNavigationProps {
  onLastPage: () => void;
  pathname: string;
  keyword?: string;
}

const navigationStore = invertly(CatalogNavigationStore);

export function useCatalogNavigation<E>({
  onLastPage,
  pathname,
  keyword = ''
}: CatalogNavigationProps): CatalogNavigation<E> {
  const [restored] = useState(() => navigationStore.restorable(pathname));
  const [records, setRecords] = useState<E[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollIsRestored = useRef(false);
  const lastPageRef = useRef(onLastPage);

  const navigation = useRef<CatalogNavigationState>({
    keyword: restored?.keyword ?? '',
    page: restored?.page ?? 0,
    scrollTop: restored?.scrollTop ?? 0
  });

  const remember = useCallback(() => {
    navigationStore.remember(pathname, navigation.current);
  }, [pathname]);

  const onPagination = useCallback(
    (pagination: PaginationEvent<E>) => {
      if (pagination.lastPage) {
        lastPageRef.current();
      }

      if (pagination.currentPage !== navigation.current.page) {
        navigation.current.page = pagination.currentPage;
        navigation.current.scrollTop = 0;

        scrollToPosition(containerRef.current);
      }

      remember();

      setRecords(pagination.suggestions);
    },
    [remember]
  );

  const onScroll = useCallback(() => {
    navigation.current.scrollTop = containerRef.current?.scrollTop ?? 0;
    remember();
  }, [remember]);

  useEffect(() => {
    lastPageRef.current = onLastPage;
  }, [onLastPage]);

  useEffect(() => {
    navigation.current.keyword = keyword;
    remember();
  }, [keyword, remember]);

  useLayoutEffect(() => {
    const container = containerRef.current;

    const isPending =
      !scrollIsRestored.current &&
      !!restored &&
      !!container &&
      !!records.length &&
      keyword === restored.keyword;

    if (isPending) {
      container.scrollTop = restored.scrollTop;
      scrollIsRestored.current = true;
    }
  }, [keyword, records, restored]);

  return useMemo(
    () => ({
      containerRef,
      onPagination,
      onScroll,
      records,
      position: restored?.page
    }),
    [onPagination, onScroll, records, restored]
  );
}
