import type { IOptions, IResult } from "../interfaces/pagination";

function calculatePagination(options: IOptions): IResult {
  const page = Number(options.page || 1);
  const limit = Number(options.limit || 10);
  const skip = (page - 1) * limit;
  const sortBy = options.sortBy || "createdAt";
  const sort = options.sort || "desc";
  return {
    skip,
    limit,
    page,
    sortBy,
    sort,
  };
}
export const paginationHelper = {
  calculatePagination,
};
