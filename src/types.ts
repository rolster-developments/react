export interface PaginationEvent<E> {
  currentPage: number;
  lastPage: boolean;
  suggestions: E[];
}
