export interface PaginationEvent<E> {
  currentPage: number;
  firstPage: boolean;
  lastPage: boolean;
  suggestions: E[];
}
