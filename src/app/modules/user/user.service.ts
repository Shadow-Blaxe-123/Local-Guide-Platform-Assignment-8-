import type { Prisma } from "@prisma/client";
import prisma from "../../../config/prisma";
import ApiError from "../../errors/ApiError";
import status from "http-status";
import { hash } from "bcryptjs";
import config from "../../../config";
import { deleteFromCloudinary } from "../../helper/fileUploader";

const createTourist = async (
  data: Prisma.UserCreateInput & { travelPreferences: string[] }
) => {
  const isExist = await prisma.user.findFirst({
    where: {
      email: data.email.trim().toLowerCase(),
      isDeleted: false,
    },
  });
  if (isExist) {
    if (isExist.pic && data.pic) {
      await deleteFromCloudinary(data.pic as string);
    }
    throw new ApiError(status.CONFLICT, "Email already exist!");
  }
  console.log(isExist);
  console.log(data.pic);
  const res = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        ...data,
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
      include: {
        user: true,
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
