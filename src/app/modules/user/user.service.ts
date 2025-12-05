import { Role, type Prisma, type User } from "@prisma/client";
import prisma from "../../../config/prisma";
import ApiError from "../../errors/ApiError";
import status from "http-status";
import { hash } from "bcryptjs";
import config from "../../../config";
import { deleteFromCloudinary } from "../../helper/fileUploader";
import type { IOptions } from "../../interfaces/pagination";
import { paginationHelper } from "../../helper/paginationHelper";
import { userSearchableFields } from "./user.constants";

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
const createGuide = async (
  data: Prisma.UserCreateInput & { dailyRate?: number; expertise: string[] }
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
        role: Role.GUIDE,
      },
    });
    return await tx.guide.create({
      data: {
        userId: user.id,
        dailyRate: data.dailyRate ? data.dailyRate : 0,
        expertise: data.expertise,
      },
      include: {
        user: true,
      },
    });
  });
  return res;
};
const createAdmin = async (data: Prisma.UserCreateInput) => {
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
        role: Role.ADMIN,
      },
    });
    return await tx.admin.create({
      data: {
        userId: user.id,
      },
      include: {
        user: true,
      },
    });
  });
  return res;
};

const getAllUsers = async (params: any, options: IOptions) => {
  const { page, limit, skip, sortBy, sort } =
    paginationHelper.calculatePagination(options);

  const { searchTerm, travelPreferences, expertise, dailyRate, ...filter } =
    params;

  const andConditions: Prisma.UserWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: userSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }
  if (expertise && filter.role === "GUIDE") {
    andConditions.push({
      guide: {
        expertise: {
          hasSome: expertise, // matches any of the values in array
        },
      },
    });
  }
  if (dailyRate && filter.role === "GUIDE") {
    andConditions.push({
      guide: {
        dailyRate,
      },
    });
  }
  if (travelPreferences && filter.role === "TOURIST") {
    andConditions.push({
      tourist: {
        travelPreferences: {
          hasSome: travelPreferences,
        },
      },
    });
  }

  if (Object.keys(filter).length > 0) {
    andConditions.push({
      AND: Object.keys(filter).map((key) => ({
        [key]: {
          equals: (filter as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.UserWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.user.findMany({
    skip,
    take: limit,
    where: whereConditions,
    orderBy: {
      [sortBy]: sort,
    },
    include: {
      admin: true,
      guide: true,
      tourist: true,
    },
  });

  const cleanedUsers = result.map(
    (user: User & { admin?: any; guide?: any; tourist?: any }) => {
      if (user.admin === null) delete user.admin;
      if (!user.guide) delete user.guide;
      if (!user.tourist) delete user.tourist;
      return user;
    }
  );

  const total = await prisma.user.count({
    where: whereConditions,
  });
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: cleanedUsers,
  };
};

const getSingleUser = async (id: string) => {
  return await prisma.user.findUnique({
    where: {
      id,
    },
  });
};

export const UserService = {
  createTourist,
  createGuide,
  createAdmin,
  getAllUsers,
  getSingleUser,
};
