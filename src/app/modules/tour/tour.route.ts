import { Router } from "express";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";
import validateRequest from "../../middlewares/validateRequest";
import { TourValidation } from "./tour.validation";
import { TourController } from "./tour.controller";
import upload from "../../middlewares/multer";

const router = Router();

router.post(
  "/create",
  auth(Role.GUIDE),
  upload.array("files", 5),
  validateRequest(TourValidation.createTourSchema),
  TourController.createTour
);
router.patch(
  "/:id",
  auth(Role.GUIDE, Role.ADMIN),
  upload.array("files", 5),
  validateRequest(TourValidation.updateTourSchema),
  TourController.updateTour
);

export const TourRoutes = router;
