import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import type { IJWTPayload } from "../../interfaces";
import { BookingStatus, PaymentStatus, Role } from "@prisma/client";
import prisma from "../../../config/prisma";

const fetchDashboardMetaData = async (user: IJWTPayload) => {
  switch (user.role) {
    case Role.ADMIN:
      return await getAdminMetaData();

    case Role.GUIDE:
      return await getGuideMetaData(user);

    case Role.TOURIST:
      return await getTouristMetaData(user);

    default:
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid user role!");
  }
};

export const MetaService = {
  fetchDashboardMetaData,
};

const getAdminMetaData = async () => {
  const guideCount = await prisma.guide.count();
  const touristCount = await prisma.tourist.count();
  const tourCount = await prisma.tour.count();
  const bookingCount = await prisma.booking.count();
  const reviewCount = await prisma.review.count();

  const totalRevenue = await prisma.payment.aggregate({
    _sum: { price: true },
    where: { status: PaymentStatus.COMPLETED },
  });

  return {
    guideCount,
    touristCount,
    tourCount,
    bookingCount,
    reviewCount,
    totalRevenue: totalRevenue._sum.price || 0,
  };
};

const getGuideMetaData = async (user: IJWTPayload) => {
  const guide = await prisma.guide.findUniqueOrThrow({
    where: { userId: user.id },
  });

  const tourCount = await prisma.tour.count({
    where: { guideId: guide.id },
  });

  const bookingCount = await prisma.booking.count({
    where: {
      tour: { guideId: guide.id },
    },
  });

  const reviewCount = await prisma.review.count({
    where: { guideId: guide.id },
  });

  const earnings = await prisma.guide.findUniqueOrThrow({
    where: { userId: user.id },
    select: { earnings: true },
  }); // @default(0)

  return {
    tourCount,
    bookingCount,
    reviewCount,
    earnings,
  };
};

const getTouristMetaData = async (user: IJWTPayload) => {
  const tourist = await prisma.tourist.findUniqueOrThrow({
    where: { userId: user.id },
  });

  const bookingCount = await prisma.booking.count({
    where: { touristId: tourist.id },
  });

  const completedCount = await prisma.booking.count({
    where: {
      touristId: tourist.id,
      status: BookingStatus.COMPLETED,
    },
  });

  const cancelledCount = await prisma.booking.count({
    where: {
      touristId: tourist.id,
      status: BookingStatus.CANCELLED,
    },
  });

  const refundedAmount = await prisma.tourist.findUniqueOrThrow({
    where: { userId: user.id },
    select: { refund: true },
  });
  const reviewCount = await prisma.review.count({
    where: { touristId: tourist.id },
  });

  return {
    bookingCount,
    completedCount,
    cancelledCount,
    refundedAmount,
    reviewCount,
  };
};
