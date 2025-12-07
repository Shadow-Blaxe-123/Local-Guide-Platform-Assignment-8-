import { Role, TourStatus, type Prisma } from "@prisma/client";
import type { IJWTPayload } from "../../interfaces";
import prisma from "../../../config/prisma";
import ApiError from "../../errors/ApiError";
import status from "http-status";
import { deleteFromCloudinary } from "../../helper/fileUploader";
import type { IOptions } from "../../interfaces/pagination";
import { paginationHelper } from "../../helper/paginationHelper";
import { tourSearchableFields } from "./tour.constants";

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

const getAllTours = async (
  params: any,
  options: IOptions,
  user?: IJWTPayload
) => {
  const { page, limit, skip, sortBy, sort } =
    paginationHelper.calculatePagination(options);

  const {
    searchTerm,
    price,
    minPrice,
    maxPrice,
    status,
    expertise,
    ...filter
  } = params;

  const andConditions: Prisma.TourWhereInput[] = [];

  // 🔍 Search Term (multi-field)
  if (searchTerm) {
    andConditions.push({
      OR: tourSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }
  // Status filtering
  if (!user || user.role === Role.TOURIST) {
    // tourists/public only see ACTIVE tours
    andConditions.push({ status: TourStatus.ACTIVE });
  } else if (status) {
    // admin/guide can filter by status
    andConditions.push({ status });
  }

  // 💰 Price Exact Match
  if (price) {
    andConditions.push({
      price: Number(price),
    });
  }
  if (expertise) {
    console.log(expertise);
    andConditions.push({
      guide: {
        is: {
          expertise: {
            hasSome: Array.isArray(expertise) ? expertise : [expertise],
          },
        },
      },
    });
  }

  // 💰 Price Range
  if (minPrice || maxPrice) {
    andConditions.push({
      price: {
        gte: minPrice !== undefined ? Number(minPrice) : 0,
        lte: maxPrice !== undefined ? Number(maxPrice) : 10000000000000,
      },
    });
  }

  // 🎯 Other filters
  if (Object.keys(filter).length > 0) {
    andConditions.push({
      AND: Object.keys(filter).map((key) => ({
        [key]: {
          equals: (filter as any)[key],
        },
      })),
    });
  }

  // ❗ Always exclude deleted tours
  if (!user || user.role === Role.TOURIST) {
    andConditions.push({ isDeleted: false });
  }

  const whereConditions: Prisma.TourWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // DB Query
  const result = await prisma.tour.findMany({
    skip,
    take: limit,
    where: whereConditions,
    orderBy: { [sortBy]: sort },
    include: {
      guide: true, // you can customize this
      reviews: true,
    },
  });

  const total = await prisma.tour.count({ where: whereConditions });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getSingleTour = async (id: string) => {
  return await prisma.tour.findUnique({
    where: {
      id,
    },
    include: {
      reviews: true,
      guide: true,
    },
  });
};

export const TourService = {
  createTour,
  updateTour,
  getAllTours,
  getSingleTour,
};
