export const parsePagination = (query = {}) => {
  const parsedPage = Number.parseInt(query.page, 10);
  const parsedLimit = Number.parseInt(query.limit, 10);

  const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
  const limit = Number.isNaN(parsedLimit) || parsedLimit < 1 ? 10 : Math.min(parsedLimit, 100);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

export const buildPaginationMeta = ({ totalItems, page, limit }) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  return {
    currentPage: page,
    totalPages,
    totalItems,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    limit,
  };
};

export const getSortConfig = (sortKey, sortMap, defaultKey = 'latest') => {
  return sortMap[sortKey] || sortMap[defaultKey] || { createdAt: -1 };
};

export const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const buildRegex = (value = '') => new RegExp(escapeRegex(value.trim()), 'i');
