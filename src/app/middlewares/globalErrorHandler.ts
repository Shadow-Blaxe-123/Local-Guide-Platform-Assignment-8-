import { Prisma } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { deleteFromCloudinary } from "../helper/fileUploader";
import type { ErrorSources } from "../interfaces/error";
import { handleZodError } from "../errors/handleZodError";
import config from "../../config";

const globalErrorHandler = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode: number = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  let success = false;
  let message = err.message || "Something went wrong!";
  let error = err;
  let errorSources: ErrorSources[] | undefined = [];

  if (err.name === "ZodError") {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statuscode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      message = "Duplicate key error!";
      error = err.meta;
      statusCode = httpStatus.CONFLICT;
    }
    if (err.code === "P2003") {
      message = "Foreign key constraint failed!";
      error = err.meta;
      statusCode = httpStatus.BAD_REQUEST;
    }
    if (err.code === "P1000") {
      message = "Authentication failed against database server!";
      error = err.meta;
      statusCode = httpStatus.BAD_GATEWAY;
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    message = "Validation Error!";
    statusCode = httpStatus.BAD_REQUEST;
    error = err.message;
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    message = "Unknown Prisma error occured!";
    statusCode = httpStatus.BAD_REQUEST;
    error = err.message;
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    message = "Prisma Client failed to initialize!";
    statusCode = httpStatus.BAD_REQUEST;
    error = err.message;
  }

  res.status(statusCode).json({
    success,
    message,
    errorSources,
    error: config.node_env === "development" ? error : null,
    stack: config.node_env === "development" ? error.stack : null,
  });
};

export default globalErrorHandler;
