/* eslint-disable @typescript-eslint/no-explicit-any */

import type { ErrorSources, HandlerResponse } from "../interfaces/error";

export const handleZodError = (err: any): HandlerResponse => {
  const errorSources: ErrorSources[] = [];
  err.issues?.forEach((issue: any) => {
    errorSources.push({
      path: issue.path[issue.path.length - 1], // Getting the nested errors, for nested schemas like name: {firstName: string, lastName: {nickName: string, surName: string}}
      message: issue.message,
    });
  });
  return {
    statuscode: 400,
    message: "Zod Error Occurred",
    errorSources,
  };
};
