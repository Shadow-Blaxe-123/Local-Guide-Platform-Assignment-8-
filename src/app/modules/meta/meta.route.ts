import { Role } from "@prisma/client";
import { Router } from "express";
import { MetaController } from "./meta.controller";
import auth from "../../middlewares/auth";

const router = Router();

router.get(
  "/",
  auth(Role.ADMIN, Role.GUIDE, Role.TOURIST),
  MetaController.fetchDashboardMetaData
);

export const MetaRoutes = router;
