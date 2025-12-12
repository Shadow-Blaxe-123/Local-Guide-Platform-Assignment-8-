import { Router } from "express";
import { softAuth } from "../../middlewares/softAuth";
import { ReviewController } from "./review.controller";
import { Role } from "@prisma/client";
import { ReviewValidation } from "./review.validation";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";

const router = Router();

router.get("/all", softAuth, ReviewController.getAllReviews);
router.get("/:id", softAuth, ReviewController.getSingleReview);

router.post(
  "/create",
  auth(Role.TOURIST),
  validateRequest(ReviewValidation.createReviewZodSchema),
  ReviewController.createReview
);
router.patch(
  "/:id",
  auth(Role.TOURIST, Role.ADMIN),

  validateRequest(ReviewValidation.updateReviewZodSchema),
  ReviewController.updateReview
);

router.delete(
  "/:id",
  auth(Role.TOURIST, Role.ADMIN),
  ReviewController.deleteReview
);

export const TourRoutes = router;

export const ReviewRoutes = router;
