import type { Prisma } from "@prisma/client";
import prisma from "../../../config/prisma";
import ApiError from "../../errors/ApiError";
import status from "http-status";
import { hash } from "bcryptjs";
import config from "../../../config";

const createTourist = async (
  data: Prisma.UserCreateInput & { travelPreferences: string[] }
) => {
  const isExist = await prisma.user.findFirst({
    where: {
      email: data.email,
      isDeleted: false,
    },
  });
  if (isExist) {
    throw new ApiError(status.CONFLICT, "Email already exist!");
  }
  const res = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: data.email,
        password: await hash(data.password, config.hash_salt),
        name: data.name,
      },
    });
    return await tx.tourist.create({
      data: {
        userId: user.id,
        travelPreferences: data.travelPreferences,
      },
    });
  });
  return res;
};
const createGuide = async (data: any) => {};
const createAdmin = async (data: any) => {};

export const UserService = {
  createTourist,
  createGuide,
  createAdmin,
  //   getAllUsers,
  //   getMyProfile,
  //   changeProfileStatus,
  //   updateMyProfie,
};
