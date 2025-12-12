import type { Request, Response } from "express";
import catchAsync from "../../helper/catchAsync";
import type { IJWTPayload } from "../../interfaces";
import { MetaService } from "./meta.service";
import sendResponse from "../../helper/sendResponse";
import status from "http-status";

const fetchDashboardMetaData = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const result = await MetaService.fetchDashboardMetaData(
      user as IJWTPayload
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Meta data retrival successfully!",
      data: result,
    });
  }
);

export const MetaController = {
  fetchDashboardMetaData,
};
