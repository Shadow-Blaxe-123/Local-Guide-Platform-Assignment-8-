import { Router } from "express";

const router = Router();

interface Route {
  path: string;
  route: Router;
}

const moduleRoutes: Route[] = [];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
