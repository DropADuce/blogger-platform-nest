export const SETTINGS = {
  get PORT() {
    return process.env.PORT ?? 5001;
  },

  get MONGO_DB_URL() {
    return process.env.MONGO_DB_URL ?? '';
  },

  get MONGO_DB_NAME() {
    return process.env.MONGO_DB_NAME;
  },
};
