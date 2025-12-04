import type { Request } from "express";
import type { FileFilterCallback } from "multer";
import ApiError from "../errors/ApiError";
import status from "http-status";
import multer from "multer";

const storage = multer.memoryStorage();

// File filter to accept only images
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new ApiError(status.BAD_REQUEST, "Only image files are allowed!"));
  }
};

// Multer upload configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export default upload;
