type APIRes<T> = {
  code: number;
  msg: string;
  data: T;
};

type PaginationParams = {
  page: number;
  page_size: number;
};

type PaginationData<T> = {
  total: number;
  page: number;
  page_size: number;
  data: T[];
};
