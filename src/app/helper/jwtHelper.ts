import { sign, verify, type JwtPayload, type SignOptions } from "jsonwebtoken";

const generateToken = (
  payload: JwtPayload,
  secret: string,
  expiresIn: string
) => {
  const token = sign(payload, secret, { expiresIn } as SignOptions);
  return token;
};

const verifyToken = (token: string, secret: string) => {
  return verify(token, secret) as JwtPayload;
};

export const jwtHelper = {
  generateToken,
  verifyToken,
};
