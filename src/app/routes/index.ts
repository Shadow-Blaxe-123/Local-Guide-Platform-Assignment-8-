import { Router } from "express";
import { UserRoute } from "../modules/user/user.route";

const router = Router();

interface Route {
  path: string;
  route: Router;
}

const moduleRoutes: Route[] = [
  {
    path: "/user",
    route: UserRoute,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
