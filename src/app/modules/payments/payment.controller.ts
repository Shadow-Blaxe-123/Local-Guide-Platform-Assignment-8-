import type { Request, Response } from "express";
import catchAsync from "../../helper/catchAsync";
import config from "../../../config";
import { stripe } from "../../../config/stripe";
import { PaymentService } from "./payment.service";
import sendResponse from "../../helper/sendResponse";

// const handleStripeWebhookEvent = catchAsync(
//   async (req: Request, res: Response) => {
//     const sig = req.headers["stripe-signature"] as string;
//     const webhookSecret = config.stripe.stripe_webhook_secret as string;
//     let event;
//     try {
//       event = await stripe.webhooks.constructEvent(
//         req.body,
//         sig,
//         webhookSecret
//       );
//     } catch (err: any) {
//       console.error("⚠️ Webhook signature verification failed.", err.message);
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     const result = await PaymentService.handleStripeWebhookEvent(event);
//     sendResponse(res, {
//       success: true,
//       statusCode: 200,
//       message: "Stripe webhook event handled successfully",
//       data: result,
//     });
//   }
// );

const handleStripeWebhookEvent = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;

  let event;

  try {
    // 🟢 verify signature using raw body
    event = stripe.webhooks.constructEvent(
      req.body, // raw buffer provided by express.raw()
      sig,
      config.stripe.stripe_webhook_secret
    );
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // process event
    await PaymentService.handleStripeWebhookEvent(event);
  } catch (err) {
    console.error("❌ Error handling webhook event:", err);
    return res.status(500).send("Webhook handler failed");
  }

  // 🟢 Stripe requires plain 200 OK
  res.status(200).send();
};

export const PaymentController = {
  handleStripeWebhookEvent,
};
