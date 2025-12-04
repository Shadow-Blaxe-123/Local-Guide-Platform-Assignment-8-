import { Router } from "express";
import { AuthValidation } from "./auth.validation";
import { AuthController } from "./auth.controller";
import { Role } from "@prisma/client";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";

const router = Router();

router.post(
  "/login",
  validateRequest(AuthValidation.loginSchema),
  AuthController.login
);

router.post(
  "/change-password",
  auth(Role.ADMIN, Role.GUIDE, Role.TOURIST),
  AuthController.changePassword
);

router.get("/me", AuthController.getMe);

export const AuthRoutes = router;
