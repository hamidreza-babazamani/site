export const requiredEnv = (name: "MONGODB_URI" | "JWT_SECRET") => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
};
