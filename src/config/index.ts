import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  frontend_url: process.env.FRONTEND_URL,
  hash_salt: Number(process.env.HASH_SALT),

  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
    api_key: process.env.CLOUDINARY_API_KEY as string,
    api_secret: process.env.CLOUDINARY_API_SECRET as string,
  },

  jwt: {
    access_token_secret: process.env.JWT_ACCESS_TOKEN_SECRET as string,
    access_token_expire: process.env.JWT_ACCESS_TOKEN_EXPIRATION as string,
    refresh_token_secret: process.env.JWT_REFRESH_TOKEN_SECRET as string,
    refresh_token_expire: process.env.JWT_REFRESH_TOKEN_EXPIRATION as string,
    reset_pass_secret: process.env.JWT_RESET_PASS_SECRET as string,
    reset_pass_token_expires_in: process.env
      .JWT_RESET_PASS_TOKEN_EXPIRES_IN as string,
  },
  stripe: {
    stripe_secret_key: process.env.STRIPE_SECRET_KEY as string,
    stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET as string,
    stripe_success_url: process.env.STRIPE_SUCCESS_URL as string,
    stripe_cancel_url: process.env.STRIPE_CANCEL_URL as string,
  },
  smtp: {
    smtp_host: process.env.SMTP_HOST as string,
    smtp_port: Number(process.env.SMTP_PORT),
    smtp_user: process.env.SMTP_USER as string,
    smtp_pass: process.env.SMTP_PASS as string,
    smtp_from: process.env.SMTP_FROM as string,
  },
};
