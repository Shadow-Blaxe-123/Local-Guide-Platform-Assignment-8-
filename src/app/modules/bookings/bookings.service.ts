// Services needed:
// 2. Accept/Decline booking and notify using email
// 3. Getall bookings
// 4. Get booking by id
// 5. Update booking

import { BookingStatus, PaymentStatus, type Prisma } from "@prisma/client";
import prisma from "../../../config/prisma";
import ApiError from "../../errors/ApiError";
import status from "http-status";
import type { IJWTPayload } from "../../interfaces";
import config from "../../../config";
import { stripe } from "../../../config/stripe";
import type { IOptions } from "../../interfaces/pagination";
import { paginationHelper } from "../../helper/paginationHelper";

const createBooking = async (
  user: IJWTPayload,
  payload: {
    tourId: string;
    scheduledAt: string;
  }
) => {
  const tour = await prisma.tour.findFirst({
    where: {
      id: payload.tourId,
      isDeleted: false,
    },
    include: {
      guide: true,
    },
  });

  const tourist = await prisma.tourist.findUnique({
    where: {
      userId: user.id,
    },
  });
  if (!tour) {
    throw new ApiError(status.NOT_FOUND, "Tour not found!");
  }
  if (!tourist) {
    throw new ApiError(status.NOT_FOUND, "Tourist not found!");
  }
  const isBooking = await prisma.booking.findFirst({
    where: {
      scheduledAt: payload.scheduledAt,
      tourId: payload.tourId,
      touristId: tourist?.id,
    },
  });
  if (isBooking) {
    throw new ApiError(status.CONFLICT, "You have already booked this tour!");
  }
  const res = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.create({
      data: {
        scheduledAt: payload.scheduledAt,
        tourId: payload.tourId,
        guideId: tour.guide.id,
        paymentStatus: PaymentStatus.PENDING,
        touristId: tourist?.id,
        price: tour.price,
        status: BookingStatus.PENDING,
      },
    });
    const payment = await tx.payment.create({
      data: {
        bookingId: booking.id,
        price: tour.price,
        status: PaymentStatus.PENDING,
      },
    });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "bdt",
            product_data: {
              name: `A booking for ${tour.title}`,
            },
            unit_amount: (tour.price as number) * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId: booking.id,
        paymentId: payment.id,
      },
      success_url: config.stripe.stripe_success_url,
      cancel_url: config.stripe.stripe_cancel_url,
    });

    return { ...booking, paymentUrl: session.url };
  });
  const guide = await prisma.user.findFirst({
    where: {
      guide: {
        id: tour.guide.id,
      },
    },
  });
  return res;
};

const updateBookingStatusGuide = async (
  user: IJWTPayload,
  id: string,
  data: { status: BookingStatus }
) => {
  const booking = await prisma.booking.findUnique({
    where: {
      id,
    },
    include: {
      tourist: true,
    },
  });
  if (!booking) {
    throw new ApiError(status.NOT_FOUND, "Booking not found!");
  }
  const guide = await prisma.guide.findUnique({
    where: {
      userId: user.id,
    },
  });
  if (booking.guideId !== guide?.id) {
    throw new ApiError(
      status.UNAUTHORIZED,
      "You are not authorized to update this booking!"
    );
  }

  if (data.status === "CONFIRMED" && booking.paymentStatus !== "COMPLETED") {
    throw new ApiError(
      status.FORBIDDEN,
      "Payment must be completed before confirming the booking!"
    );
  }

  // Cancellation ALWAYS allowed, regardless of payment
  return await prisma.$transaction(async (tx) => {
    if (data.status === "CANCELLED") {
      const refund = (booking.tourist.refund ?? 0) + booking.price;

      await tx.tourist.update({
        where: { id: booking.touristId },
        data: { refund },
      });
      await tx.booking.update({
        where: { id },
        data: { paymentStatus: PaymentStatus.REFUNDED },
      });
    }

    return tx.booking.update({
      where: { id },
      data,
    });
  });
};
const updateBookingStatusTourist = async (
  user: IJWTPayload,
  id: string,
  data: { status: BookingStatus }
) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { guide: true },
  });
  if (!booking) throw new ApiError(status.NOT_FOUND, "Booking not found!");

  const tourist = await prisma.tourist.findUnique({
    where: { userId: user.id },
  });

  if (booking.touristId !== tourist?.id) {
    throw new ApiError(
      status.UNAUTHORIZED,
      "You are not authorized to update this booking!"
    );
  }

  // Tourist marking COMPLETED
  if (data.status === "COMPLETED") {
    // Must already be confirmed
    if (booking.status !== "CONFIRMED") {
      throw new ApiError(
        status.FORBIDDEN,
        "You can only mark a confirmed booking as completed."
      );
    }

    // Date must be today or in the past
    const now = new Date();
    const scheduledAt = new Date(booking.scheduledAt);

    if (now < scheduledAt) {
      throw new ApiError(
        status.FORBIDDEN,
        "You cannot complete the tour before its scheduled date."
      );
    }

    // No refund for completion
    return prisma.$transaction(async (tx) => {
      const earnings = booking.guide.earnings + booking.price;
      await tx.guide.update({
        where: {
          id: booking.guideId,
        },
        data: {
          earnings,
        },
      });

      return tx.booking.update({
        where: { id },
        data: { status: "COMPLETED" },
      });
    });
  }

  // Tourist CANCEL
  if (data.status === "CANCELLED") {
    return prisma.$transaction(async (tx) => {
      const refund = tourist.refund + booking.price;

      await tx.tourist.update({
        where: { id: tourist.id },
        data: { refund },
      });

      return tx.booking.update({
        where: { id },
        data: { status: "CANCELLED", paymentStatus: "REFUNDED" },
      });
    });
  }
};

const getSingleBooking = async (id: string, user: IJWTPayload) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { guide: true, tourist: true },
  });

  if (!booking) {
    throw new ApiError(status.NOT_FOUND, "Booking not found!");
  }

  // Admin always has access
  if (user.role === "ADMIN") {
    return booking;
  }

  if (user.role === "GUIDE") {
    const guide = await prisma.guide.findUnique({
      where: { userId: user.id },
    });

    if (!guide) {
      throw new ApiError(status.FORBIDDEN, "Guide profile not found!");
    }

    if (booking.guideId !== guide.id) {
      throw new ApiError(
        status.UNAUTHORIZED,
        "You are not authorized to view this booking!"
      );
    }

    return booking;
  }

  if (user.role === "TOURIST") {
    const tourist = await prisma.tourist.findUnique({
      where: { userId: user.id },
    });

    if (!tourist) {
      throw new ApiError(status.FORBIDDEN, "Tourist profile not found!");
    }

    if (booking.touristId !== tourist.id) {
      throw new ApiError(
        status.UNAUTHORIZED,
        "You are not authorized to view this booking!"
      );
    }

    return booking;
  }
};

const getAllBookings = async (
  params: any,
  options: IOptions,
  user: IJWTPayload
) => {
  const { page, limit, skip, sortBy, sort } =
    paginationHelper.calculatePagination(options);

  const {
    status,
    paymentStatus,
    scheduledAt,
    minPrice,
    maxPrice,
    minDateTime,
    maxDateTime,

    ...filter
  } = params;

  const andConditions: Prisma.BookingWhereInput[] = [];

  //
  // ROLE-BASED ACCESS CONTROL
  //
  if (user.role === "GUIDE") {
    const guide = await prisma.guide.findUnique({
      where: { userId: user.id },
    });
    if (!guide) {
      throw new ApiError(status.FORBIDDEN, "Guide profile not found!");
    }
    andConditions.push({ guideId: guide.id });
  }

  if (user.role === "TOURIST") {
    const tourist = await prisma.tourist.findUnique({
      where: { userId: user.id },
    });
    if (!tourist) {
      throw new ApiError(status.FORBIDDEN, "Tourist profile not found!");
    }
    andConditions.push({ touristId: tourist.id });
  }

  // Admin sees all — no restrictions

  // FILTERS
  //

  // Status filter (Pending / Confirmed / Completed / Cancelled)
  if (status) {
    andConditions.push({ status });
  }

  // Payment status filter
  if (paymentStatus) {
    andConditions.push({ paymentStatus });
  }

  // Specific scheduled date
  if (scheduledAt) {
    andConditions.push({
      scheduledAt: new Date(scheduledAt),
    });
  }

  //
  // Price Range Filtering
  //
  if (minPrice || maxPrice) {
    andConditions.push({
      price: {
        gte: minPrice !== undefined ? Number(minPrice) : 0,
        lte: maxPrice !== undefined ? Number(maxPrice) : 100000000000,
      },
    });
  }

  // DateTime range filtering

  if (minDateTime || maxDateTime) {
    const rangeFilter: Prisma.DateTimeFilter = {};

    if (minDateTime) {
      const parsed = new Date(minDateTime);

      if (isNaN(parsed.getTime())) {
        throw new ApiError(
          status.BAD_REQUEST,
          "Invalid minDateTime format. Must be ISO date or ISO datetime."
        );
      }

      // If only date without time → assume start of day
      if (/^\d{4}-\d{2}-\d{2}$/.test(minDateTime)) {
        rangeFilter.gte = new Date(`${minDateTime}T00:00:00.000Z`);
      } else {
        rangeFilter.gte = parsed;
      }
    }

    if (maxDateTime) {
      const parsed = new Date(maxDateTime);

      if (isNaN(parsed.getTime())) {
        throw new ApiError(
          status.BAD_REQUEST,
          "Invalid maxDateTime format. Must be ISO date or ISO datetime."
        );
      }

      // If only date without time → assume end of day
      if (/^\d{4}-\d{2}-\d{2}$/.test(maxDateTime)) {
        rangeFilter.lte = new Date(`${maxDateTime}T23:59:59.999Z`);
      } else {
        rangeFilter.lte = parsed;
      }
    }

    andConditions.push({
      scheduledAt: rangeFilter,
    });
  }

  //
  // Any Additional Exact-Match Filters
  //
  if (Object.keys(filter).length > 0) {
    andConditions.push({
      AND: Object.keys(filter).map((key) => ({
        [key]: { equals: (filter as any)[key] },
      })),
    });
  }

  //
  // FINAL WHERE CONDITION
  //
  const whereConditions: Prisma.BookingWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  //
  // QUERY DATABASE
  //
  const bookings = await prisma.booking.findMany({
    skip,
    take: limit,
    where: whereConditions,
    orderBy: { [sortBy]: sort },
    include: {
      guide: true,
      tourist: true,
    },
  });

  const total = await prisma.booking.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: bookings,
  };
};

export const BookingsService = {
  createBooking,
  updateBookingStatusGuide,
  updateBookingStatusTourist,
  getSingleBooking,
  getAllBookings,
};
