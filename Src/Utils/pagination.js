/**
 * Builds a MongoDB-compatible pagination object from query params.
 *
 * @param {object} query   - Express req.query
 * @param {number} defaultLimit - items per page (default 10)
 * @returns {{ skip: number, limit: number, page: number, limit: number }}
 */
export const getPagination = (query, defaultLimit = 10) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Builds a standard paginated response meta object.
 *
 * @param {number} total - total documents matching query
 * @param {number} page  - current page
 * @param {number} limit - items per page
 */
export const buildPaginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page * limit < total,
  hasPrevPage: page > 1,
});
