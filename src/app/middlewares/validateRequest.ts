import type { NextFunction, Request, Response } from "express";
import type { ZodObject } from "zod";

const validateRequest =
  (schema: ZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body.data) {
        req.body = JSON.parse(req.body.data);
      }
      console.log(req.body);
      await schema.parseAsync(req.body);
      return next();
    } catch (error) {
      next(error);
    }
  };

export default validateRequest;
