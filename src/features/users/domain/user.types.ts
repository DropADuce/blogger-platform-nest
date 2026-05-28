export type CreateUserDTO = {
  login: string;
  email: string;
  password: string;
};

export type CreatedUserItem = {
  id: string;
  login: string;
  email: string;
  createdAt: string;
};
