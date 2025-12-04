import jwt from "jsonwebtoken";

const generateToken = (
  payload: jwt.JwtPayload,
  secret: string,
  expiresIn: string
) => {
  const token = jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
  return token;
};

const verifyToken = (token: string, secret: string) => {
  return jwt.verify(token, secret) as jwt.JwtPayload;
};

export const jwtHelper = {
  generateToken,
  verifyToken,
};
