import status from "http-status";
import prisma from "../../../config/prisma";
import ApiError from "../../errors/ApiError";
import { compare, hash } from "bcryptjs";
import { jwtHelper } from "../../helper/jwtHelper";
import config from "../../../config";
import type { IJWTPayload } from "../../interfaces";

const login = async (payload: { email: string; password: string }) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      isDeleted: false,
    },
  });
  const isPasswordCorrect = await compare(payload.password, user.password);
  if (!isPasswordCorrect) {
    throw new ApiError(status.BAD_REQUEST, "Invalid password");
  }
  const accessToken = jwtHelper.generateToken(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    config.jwt.access_token_secret,
    config.jwt.access_token_expire
  );
  const refreshToken = jwtHelper.generateToken(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    config.jwt.refresh_token_secret,
    config.jwt.refresh_token_expire
  );

  return {
    accessToken,
    refreshToken,
  };
};

const changePassword = async (
  user: IJWTPayload,
  payload: { oldPassword: string; newPassword: string }
) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
      isDeleted: false,
    },
  });

  const isCorrectPassword: boolean = await compare(
    payload.oldPassword,
    userData.password
  );

  if (!isCorrectPassword) {
    throw new ApiError(status.BAD_REQUEST, "Password incorrect!");
  }

  const hashedPassword: string = await hash(
    payload.newPassword,
    Number(config.hash_salt)
  );

  await prisma.user.update({
    where: {
      email: userData.email,
    },
    data: {
      password: hashedPassword,
    },
  });

  return {
    message: "Password changed successfully!",
  };
};

const getMe = async (session: any) => {
  const accessToken = session.accessToken;
  const decodedData = jwtHelper.verifyToken(
    accessToken,
    config.jwt.access_token_secret
  );
  console.log(decodedData.role);

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData.email,
      isDeleted: false,
    },
    include: {
      [decodedData.role.toLowerCase()]: true,
    },
  });

  const { password, ...userWithoutPassword } = userData;
  return userWithoutPassword;
};

export const AuthService = {
  login,
  changePassword,
  getMe,
};
