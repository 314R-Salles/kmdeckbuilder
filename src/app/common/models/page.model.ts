// forme de réponse paginée renvoyée par le backend (endpoints /decks, /cards...)
export interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
  };
  empty: boolean;
  first: boolean;
  last: boolean;
  totalElements: number;
  totalPages: number;
}
