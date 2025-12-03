class ApiError extends Error {
  statusCode: number;
  constructor(statusCode: number, msg: string | undefined, stack = "") {
    super(msg);
    this.statusCode = statusCode;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
