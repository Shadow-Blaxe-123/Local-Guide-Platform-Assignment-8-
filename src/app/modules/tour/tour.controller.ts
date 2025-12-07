import type { Request, Response } from "express";
import catchAsync from "../../helper/catchAsync";
import { TourService } from "./tour.service";
import sendResponse from "../../helper/sendResponse";
import status from "http-status";
import { uploadImage } from "../../helper/fileUploader";
import type { IJWTPayload } from "../../interfaces";

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

export const TourController = {
  createTour,
  updateTour,
};
