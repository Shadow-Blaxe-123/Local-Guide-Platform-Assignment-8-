import { Router } from "express";
import { UserController } from "./user.controller";
import upload from "../../middlewares/multer";
import validateRequest from "../../middlewares/validateRequest";
import { UserValidation } from "./user.validation";

const router = Router();

router.post(
  "/create-tourist",
  upload.single("file"),
  validateRequest(UserValidation.createTouristZodSchema),
  UserController.createTourist
);
router.post(
  "/create-admin",
  upload.single("file"),
  validateRequest(UserValidation.createTouristZodSchema),
  UserController.createAdmin
);
router.post(
  "/create-guide",
  upload.single("file"),
  validateRequest(UserValidation.createTouristZodSchema),
  UserController.createGuide
);

export const UserRoute = router;
