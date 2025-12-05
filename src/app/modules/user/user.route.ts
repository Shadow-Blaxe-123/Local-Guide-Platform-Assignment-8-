import { Router } from "express";
import { UserController } from "./user.controller";
import upload from "../../middlewares/multer";
import validateRequest from "../../middlewares/validateRequest";
import { UserValidation } from "./user.validation";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";

const router = Router();

router.post(
  "/create-tourist",
  upload.single("file"),
  validateRequest(UserValidation.createTouristZodSchema),
  UserController.createTourist
);
router.post(
  "/create-admin",
  auth(Role.ADMIN),
  upload.single("file"),
  validateRequest(UserValidation.createAdminZodSchema),
  UserController.createAdmin
);
router.post(
  "/create-guide",
  upload.single("file"),
  validateRequest(UserValidation.createGuideZodSchema),
  UserController.createGuide
);

router.get(
  "/all",
  auth(Role.ADMIN),

  UserController.getAllUsers
);
router.get(
  "/:id",
  auth(Role.ADMIN),

  UserController.getSingleUser
);

export const UserRoute = router;
