import { Router } from "express";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";
import validateRequest from "../../middlewares/validateRequest";
import { TourValidation } from "./tour.validation";
import { TourController } from "./tour.controller";
import upload from "../../middlewares/multer";
import { softAuth } from "../../middlewares/softAuth";

const router = Router();

router.get("/all", softAuth, TourController.getAllTours);
router.get("/:id", softAuth, TourController.getSingleTour);

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

router.delete("/:id", auth(Role.GUIDE, Role.ADMIN), TourController.deleteTour);

export const TourRoutes = router;
