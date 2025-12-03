export interface IOptions {
  page?: number | string;
  limit?: number | string;
  sortBy?: string;
  sort?: string;
}

export interface IResult {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sort: string;
}
