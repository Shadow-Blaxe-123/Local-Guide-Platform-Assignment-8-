import type { Request, Response } from "express";
import catchAsync from "../../helper/catchAsync";
import { TourService } from "./tour.service";
import sendResponse from "../../helper/sendResponse";
import status from "http-status";
import { uploadImage } from "../../helper/fileUploader";
import type { IJWTPayload } from "../../interfaces";
import pick from "../../helper/pick";
import { tourFilterableFields } from "./tour.constants";

const createTour = catchAsync(async (req: Request, res: Response) => {
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    const uploadedImages = [];

    // Loop through the uploaded files and upload them
    for (const file of req.files) {
      const filename = `image_${Date.now()}`; // You can customize this
      const result = await uploadImage(file.buffer, filename); // Assuming uploadImage returns { secure_url }

      if (result?.secure_url) {
        uploadedImages.push(result.secure_url); // Collect URLs of uploaded images
      }
    }

    // Now, add the array of URLs to req.body
    req.body.images = uploadedImages; // Store URLs in `pics` or a similar field
  }

  const result = await TourService.createTour(
    req.user as IJWTPayload,
    req.body
  );
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Tour created successfully!",
    data: result,
  });
});
const updateTour = catchAsync(async (req: Request, res: Response) => {
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    const uploadedImages = [];

    // Loop through the uploaded files and upload them
    for (const file of req.files) {
      const filename = `image_${Date.now()}`; // You can customize this
      const result = await uploadImage(file.buffer, filename); // Assuming uploadImage returns { secure_url }

      if (result?.secure_url) {
        uploadedImages.push(result.secure_url); // Collect URLs of uploaded images
      }
    }

    // Now, add the array of URLs to req.body
    req.body.images = uploadedImages; // Store URLs in `pics` or a similar field
  }

  const result = await TourService.updateTour(
    req.user as IJWTPayload,
    req.params.id as string,
    req.body
  );
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Tour updated successfully!",
    data: result,
  });
});
const getAllTours = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ["page", "limit", "sortBy", "sort"]);
  const filters = pick(req.query, tourFilterableFields);

  const result = await TourService.getAllTours(
    filters,
    options,
    req.user ? req.user : undefined
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Tours retrieved successfully!",
    data: result.data,
    meta: result.meta,
  });
});
const getSingleTour = catchAsync(async (req: Request, res: Response) => {
  const result = await TourService.getSingleTour(req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Tour retrieved successfully!",
    data: result,
  });
});

const deleteTour = catchAsync(async (req: Request, res: Response) => {
  const result = await TourService.deleteTour(
    req.params.id as string,
    req.user as IJWTPayload
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Tour deleted successfully!",
    data: result,
  });
});

export const TourController = {
  createTour,
  updateTour,
  getAllTours,
  getSingleTour,
  deleteTour,
};
