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

  get EMAIL_USER() {
    return process.env.EMAIL_USER ?? '';
  },

  get EMAIL_PASSWORD() {
    return process.env.EMAIL_PASSWORD ?? '';
  },
};
