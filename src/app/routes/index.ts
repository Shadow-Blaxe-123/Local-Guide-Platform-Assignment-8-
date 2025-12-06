import { Router } from "express";
import { UserRoute } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { TourRoutes } from "../modules/tour/tour.route";

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
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/tour",
    route: TourRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
