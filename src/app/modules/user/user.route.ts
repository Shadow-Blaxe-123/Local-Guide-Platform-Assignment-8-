import { Router } from "express";
import { UserController } from "./user.controller";

const router = Router();

router.post("/create-tourist", UserController.createTourist);
router.post("/create-admin", UserController.createAdmin);
router.post("/create-guide", UserController.createGuide);

export const UserRoute = router;
