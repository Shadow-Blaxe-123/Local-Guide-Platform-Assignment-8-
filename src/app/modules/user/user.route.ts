import { Router } from "express";
import { UserController } from "./user.controller";
import upload from "../../middlewares/multer";
import validateRequest from "../../middlewares/validateRequest";

const router = Router();

router.post(
  "/create-tourist",
  upload.single("file"),
  //   validateRequest(),
  UserController.createTourist
);
router.post("/create-admin", UserController.createAdmin);
router.post("/create-guide", UserController.createGuide);

export const UserRoute = router;
