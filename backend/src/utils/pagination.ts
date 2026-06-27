export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const getPaginationOptions = (
  queryPage?: string,
  queryLimit?: string
): PaginationOptions => {
  const page = Math.max(1, parseInt(queryPage ?? '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(queryLimit ?? '10', 10) || 10));
  return { page, limit };
};

export const buildPaginationMeta = (
  total: number,
  page: number,
  limit: number
): PaginationMeta => {
  const pages = Math.ceil(total / limit);
  return { page, limit, total, pages, hasNext: page < pages, hasPrev: page > 1 };
};

export const getSkip = (page: number, limit: number): number => (page - 1) * limit;
