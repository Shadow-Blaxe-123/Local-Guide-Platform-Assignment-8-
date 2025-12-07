import { PaymentStatus } from "@prisma/client";
import prisma from "../../../config/prisma";
import type Stripe from "stripe";

const handleStripeWebhookEvent = async (event: Stripe.Event) => {
  console.log(event.type);
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;
      console.log(session);
      const bookingId = session.metadata?.bookingId;
      const paymentId = session.metadata?.paymentId;

      await prisma.booking.update({
        where: {
          id: bookingId,
        },
        data: {
          paymentStatus:
            session.payment_status === "paid"
              ? PaymentStatus.COMPLETED
              : PaymentStatus.CANCELLED,
        },
      });

      await prisma.payment.update({
        where: {
          id: paymentId,
        },
        data: {
          status:
            session.payment_status === "paid"
              ? PaymentStatus.COMPLETED
              : PaymentStatus.CANCELLED,
          paymentGatewayData: session,
        },
      });

      break;
    }

    default:
      console.log(`❕Unhandled event type: ${event.type}`);
  }
};

export const PaymentService = {
  handleStripeWebhookEvent,
};
