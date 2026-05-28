export const SETTINGS = {
  get MONGO_DB_URL() {
    return process.env.MONGO_DB_URL ?? '';
  },
  get MONGO_DB_NAME() {
    return process.env.MONGO_DB_NAME;
  },
};
