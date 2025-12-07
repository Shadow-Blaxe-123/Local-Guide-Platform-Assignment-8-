import type {
  CloudinaryUploadOptions,
  CloudinaryUploadResult,
} from "../interfaces/cloudinary";
import cloudinary from "../../config/cloudinary";
import { createReadStream } from "streamifier";
import ApiError from "../errors/ApiError";
import status from "http-status";
// ============================================
// 4. UPLOAD UTILITIES (utils/cloudinaryUpload.js)
// ============================================

// Upload buffer to Cloudinary
const uploadToCloudinary = (
  buffer: Buffer,
  folder: string,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: "auto",
        ...options,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result as unknown as CloudinaryUploadResult);
          console.log("CLOUDINARY UPLOAD RESULT:", result);
        }
      }
    );

    createReadStream(buffer).pipe(uploadStream);
  });
};

// Upload image with standard settings
export const uploadImage = async (buffer: Buffer, filename: string) => {
  try {
    return await uploadToCloudinary(buffer, "uploads/images", {
      public_id: filename,
      transformation: [
        { width: 1000, height: 1000, crop: "limit" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    });
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, "Error uploading image");
  }
};

// Delete image from Cloudinary

export const deleteFromCloudinary = async (url: string) => {
  try {
    // const regex = /\/v\d+\/(.*?)\.(jpg|png|gif|jpeg|webp)$/i;
    const regex = /\/v\d+\/(.+?)(?:\.[a-zA-Z]{3,4})$/;
    const match = url.match(regex);
    if (match && match[1]) {
      const publicId = match[1].trim();
      console.log(cloudinary.config());
      const res = await cloudinary.uploader.destroy(publicId, {
        invalidate: true,
      });
      console.log(publicId);
      console.log(res);
      console.log(`File ${publicId} deleted from cloudinary`);
    }
  } catch (error: any) {
    throw new ApiError(
      500,
      "Error deleting image from cloudinary",
      error.message
    );
  }
};
