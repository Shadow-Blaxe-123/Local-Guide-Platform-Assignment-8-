import { Role, type Prisma } from "@prisma/client";
import type { IJWTPayload } from "../../interfaces";
import prisma from "../../../config/prisma";
import ApiError from "../../errors/ApiError";
import status from "http-status";
import { deleteFromCloudinary } from "../../helper/fileUploader";

const createTour = async (user: IJWTPayload, data: Prisma.TourCreateInput) => {
  const guide = await prisma.guide.findUnique({
    where: {
      userId: user.id,
    },
  });
  const isExist = await prisma.tour.findFirst({
    where: {
      guideId: guide?.id as string,
      title: data.title,
    },
  });
  if (isExist) {
    throw new ApiError(
      status.CONFLICT,
      "You already have a tour with this title!"
    );
  }
  return await prisma.tour.create({
    data: {
      ...data,
      //   guideId: user.id,
      guide: {
        connect: {
          id: guide?.id as string,
        },
      },
    },
  });
};
const updateTour = async (
  user: IJWTPayload,
  id: string,
  data: Prisma.TourUpdateInput & { deletedImages?: string[] }
) => {
  const guide = await prisma.guide.findUnique({
    where: {
      userId: user.id,
    },
  });
  const isExist = await prisma.tour.findUnique({
    where: {
      id,
    },
  });
  if (!isExist) {
    throw new ApiError(status.NOT_FOUND, "There is no such tour!");
  }
  if (user.role === Role.GUIDE && isExist.guideId !== guide?.id) {
    throw new ApiError(
      status.UNAUTHORIZED,
      "You can change only your listings!"
    );
  }
  // IF code goes here it means that user is Admin or the correct user
  const { deletedImages, ...rest } = data;
  // Delete images from Cloudinary if necessary
  const imagesToDelete = (deletedImages ?? []).filter((img) =>
    isExist.images?.includes(img)
  );

  // Delete Cloudinary images safely
  if (imagesToDelete.length > 0) {
    await Promise.all(
      imagesToDelete.map((img) =>
        deleteFromCloudinary(img)
          .then(() => console.log("Deleted:", img))
          .catch((err) =>
            console.error("Failed to delete Cloudinary image:", img, err)
          )
      )
    );
  }
  let cleanedImages = isExist.images ?? [];

  if (deletedImages) {
    cleanedImages = cleanedImages.filter((img) => !deletedImages.includes(img));
  }
  if (Array.isArray(data.images) && data.images.length > 0) {
    cleanedImages = [...cleanedImages, ...(data.images as string[])];
  }
  return await prisma.tour.update({
    where: {
      id,
    },
    data: {
      ...rest,
      images: cleanedImages,
    },
  });
};

export const TourService = {
  createTour,
  updateTour,
};
