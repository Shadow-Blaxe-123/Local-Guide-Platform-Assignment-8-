import { Prisma, Role } from "@prisma/client";
import prisma from "../../../config/prisma";
import ApiError from "../../errors/ApiError";
import status from "http-status";
import type { IJWTPayload } from "../../interfaces";
import { paginationHelper } from "../../helper/paginationHelper";
import type { IOptions } from "../../interfaces/pagination";

//
// ────────────────────────────────────────────────
//   CREATE REVIEW (Tourist Only)
// ────────────────────────────────────────────────
//

const createReview = async (
  user: IJWTPayload,
  payload: {
    tourId: string;
    rating: number;
    comment: string;
  }
) => {
  if (user.role !== Role.TOURIST) {
    throw new ApiError(
      status.UNAUTHORIZED,
      "Only tourists can create reviews."
    );
  }

  const tourist = await prisma.tourist.findUnique({
    where: { userId: user.id },
  });

  if (!tourist) {
    throw new ApiError(status.NOT_FOUND, "Tourist profile not found.");
  }

  const tour = await prisma.tour.findUnique({
    where: { id: payload.tourId },
    include: { guide: true },
  });

  if (!tour) {
    throw new ApiError(status.NOT_FOUND, "Tour not found.");
  }
  const booking = await prisma.booking.findFirst({
    where: {
      touristId: tourist.id,
      tourId: payload.tourId,
    },
  });

  if (!booking) {
    throw new ApiError(
      status.NOT_FOUND,
      "You cannot review this tour. As you never went on it!"
    );
  }
  if (booking.status !== "COMPLETED") {
    throw new ApiError(
      status.FORBIDDEN,
      "You cannot review before tour is completed."
    );
  }

  // Optional: prevent multiple reviews for same tour
  const existing = await prisma.review.findFirst({
    where: {
      tourId: payload.tourId,
      touristId: tourist.id,
    },
  });
  if (existing) {
    throw new ApiError(status.CONFLICT, "You have already reviewed this tour.");
  }
  return prisma.$transaction(async (tx) => {
    const res = await tx.review.create({
      data: {
        tourId: payload.tourId,
        touristId: tourist.id,
        guideId: tour.guideId,
        rating: payload.rating,
        comment: payload.comment,
      },
    });
    const avgRating = await tx.review.aggregate({
      where: {
        guideId: tour.guideId,
      },
      _avg: {
        rating: true,
      },
    });

    await tx.guide.update({
      where: { id: tour.guideId },
      data: {
        avgRating: avgRating._avg.rating || 0,
      },
    });
    return res;
  });
};

//
// ────────────────────────────────────────────────
//   UPDATE REVIEW (Admin or the Tourist who wrote it)
// ────────────────────────────────────────────────
//

const updateReview = async (
  user: IJWTPayload,
  id: string,
  data: Prisma.ReviewUpdateInput
) => {
  const review = await prisma.review.findUnique({
    where: { id },
  });

  if (!review) {
    throw new ApiError(status.NOT_FOUND, "Review not found.");
  }

  // Tourist can edit ONLY their own reviews
  if (user.role === Role.TOURIST) {
    const tourist = await prisma.tourist.findUnique({
      where: { userId: user.id },
    });
    if (review.touristId !== tourist?.id) {
      throw new ApiError(
        status.UNAUTHORIZED,
        "You are not authorized to edit this review."
      );
    }
  }

  // Admin can update anything

  return prisma.$transaction(async (tx) => {
    const res = await tx.review.update({
      where: { id },
      data,
    });
    if (data.rating) {
      const avgRating = await tx.review.aggregate({
        where: {
          guideId: review.guideId,
        },
        _avg: {
          rating: true,
        },
      });

      await tx.guide.update({
        where: { id: review.guideId },
        data: {
          avgRating: avgRating._avg.rating || 0,
        },
      });
    }
    return res;
  });
};

//
// ────────────────────────────────────────────────
//   DELETE REVIEW (Admin or the Tourist who wrote it)
// ────────────────────────────────────────────────
//

const deleteReview = async (user: IJWTPayload, id: string) => {
  const exists = await prisma.review.findUnique({
    where: { id },
  });

  if (!exists) {
    throw new ApiError(status.NOT_FOUND, "Review not found.");
  }
  if (user.role === "TOURIST") {
    const tourist = await prisma.tourist.findUnique({
      where: { userId: user.id },
    });

    if (exists.touristId !== tourist?.id) {
      throw new ApiError(
        status.UNAUTHORIZED,
        "You are not authorized to delete this review."
      );
    }
  }
  return await prisma.$transaction(async (tx) => {
    const res = await tx.review.delete({
      where: { id },
    });

    const avgRating = await tx.review.aggregate({
      where: {
        guideId: exists.guideId,
      },
      _avg: {
        rating: true,
      },
    });

    await tx.guide.update({
      where: { id: exists.guideId },
      data: {
        avgRating: avgRating._avg.rating || 0,
      },
    });
    return res;
  });
};

//
// ────────────────────────────────────────────────
//   GET SINGLE REVIEW (Role-based Access)
// ────────────────────────────────────────────────
//

const getSingleReview = async (id: string) => {
  const review = await prisma.review.findUnique({
    where: { id },
    include: {
      tour: true,
      guide: true,
      tourist: true,
    },
  });

  if (!review) {
    throw new ApiError(status.NOT_FOUND, "Review not found.");
  }

  return review;
};

//
// ────────────────────────────────────────────────
//   GET ALL REVIEWS (Role-based filtering + search)
// ────────────────────────────────────────────────
//

const getAllReviews = async (
  params: any,
  options: IOptions,
  user: IJWTPayload
) => {
  const { page, limit, skip, sortBy, sort } =
    paginationHelper.calculatePagination(options);

  const { searchTerm, rating, ...filter } = params;

  const andConditions: Prisma.ReviewWhereInput[] = [];

  // ─── Search Term Support ───────────────────────
  if (searchTerm) {
    andConditions.push({
      OR: [{ comment: { contains: searchTerm, mode: "insensitive" } }],
    });
  }

  // ─── Filter by rating ──────────────────────────
  if (rating) {
    andConditions.push({
      rating: Number(rating),
    });
  }

  // ─── Role-based Filtering ──────────────────────
  if (user.role === Role.TOURIST) {
    const tourist = await prisma.tourist.findUnique({
      where: { userId: user.id },
    });
    if (!tourist) {
      throw new ApiError(status.NOT_FOUND, "Tourist profile not found!");
    }
    andConditions.push({ touristId: tourist?.id });
  }

  if (user.role === Role.GUIDE) {
    const guide = await prisma.guide.findUnique({
      where: { userId: user.id },
    });
    if (!guide) {
      throw new ApiError(status.NOT_FOUND, "Guide profile not found!");
    }
    andConditions.push({ guideId: guide?.id });
  }

  // Admin sees all

  // Other filters
  if (Object.keys(filter).length > 0) {
    andConditions.push({
      AND: Object.entries(filter).map(([key, val]) => ({
        [key]: { equals: val },
      })),
    });
  }

  const whereConditions: Prisma.ReviewWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.review.findMany({
    skip,
    take: limit,
    where: whereConditions,
    orderBy: { [sortBy]: sort },
    include: {
      tour: true,
      guide: true,
      tourist: true,
    },
  });

  const total = await prisma.review.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

//
// ────────────────────────────────────────────────
//   EXPORT
// ────────────────────────────────────────────────
//

export const ReviewService = {
  createReview,
  updateReview,
  deleteReview,
  getSingleReview,
  getAllReviews,
};
