import { Router } from "express";
import { UserRoute } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { TourRoutes } from "../modules/tour/tour.route";
import { BookingsRoutes } from "../modules/bookings/bookings.route";
import { ReviewRoutes } from "../modules/reviews/review.route";
import { MetaRoutes } from "../modules/meta/meta.route";

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
  {
    path: "/booking",
    route: BookingsRoutes,
  },
  {
    path: "/review",
    route: ReviewRoutes,
  },
  {
    path: "/meta",
    route: MetaRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
