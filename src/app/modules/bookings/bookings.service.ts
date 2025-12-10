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
import { sendEmail } from "../../helper/sendEmail";

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
  sendEmail({
    to: guide?.email as string,
    subject: "New Booking",
    templateName: "bookingNotification",
    templateData: {
      touristName: user.name,
      scheduledAt: payload.scheduledAt,
      tourTitle: tour.title,
      guideName: guide?.name,
    },
  });
  return res;
};

export const BookingsService = {
  createBooking,
};
