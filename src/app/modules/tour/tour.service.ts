import type { Prisma } from "@prisma/client";
import type { IJWTPayload } from "../../interfaces";
import prisma from "../../../config/prisma";

const createTour = async (user: IJWTPayload, data: Prisma.TourCreateInput) => {
  const guide = await prisma.guide.findUnique({
    where: {
      userId: user.id,
    },
  });
  return await prisma.tour.create({
    data: {
      ...data,
      //   guideId: user.id,
      guide: {
        connect: {
          id: guide?.id as string,
        },
      },
    },
  });
};

export const TourService = {
  createTour,
};
