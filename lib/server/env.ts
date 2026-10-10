import "server-only";
export { requiredEnv } from "./env-core";

export const env = {
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "1d",
  r2AccountId: process.env.R2_ACCOUNT_ID,
  r2AccessKeyId: process.env.R2_ACCESS_KEY_ID,
  r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  r2BucketName: process.env.R2_BUCKET_NAME,
  r2PublicUrl: process.env.R2_PUBLIC_URL,
  s3Endpoint: process.env.S3_ENDPOINT,
  s3Region: process.env.S3_REGION ?? "us-east-1",
  imageKitPrivateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  imageKitPublicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  imageKitUrlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
} as const;

export const hasR2 = Boolean(
  env.s3Endpoint &&
  env.r2AccessKeyId &&
  env.r2SecretAccessKey &&
  env.r2BucketName,
);

export const hasImageKit = Boolean(
  env.imageKitPrivateKey &&
  env.imageKitPublicKey &&
  env.imageKitUrlEndpoint,
);
