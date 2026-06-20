import request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';

import { CreateUserInputDto } from 'modules/user-accounts/api/input-dto/create-user.input-dto';
import { UserViewDto } from 'modules/user-accounts/api/view-dto/user.view-dto';

export class UsersTestingManager {
  private DEFAULT_PASSWORD: string = '123456789';

  constructor(private app: INestApplication) {}

  async createUser(params: { DTO: CreateUserInputDto; statusCode?: number }) {
    const response = await request(this.app.getHttpServer())
      .post('/users')
      .send(params.DTO)
      .auth(process.env.BASIC_USERNAME ?? '', process.env.BASIC_PASSWORD ?? '')
      .expect(params?.statusCode ?? HttpStatus.CREATED);

    return response.body;
  }

  async createManyUsers(count: number) {
    const usersPromises: Array<Promise<UserViewDto>> = [];

    Array.from({ length: count }).forEach((_: unknown, idx: number) => {
      const response = this.createUser({
        DTO: {
          login: `test_${idx}`,
          email: `test.${idx}@gmail.com`,
          password: this.DEFAULT_PASSWORD,
        },
      });

      usersPromises.push(response);
    });

    return Promise.all(usersPromises);
  }

  async login(params: {
    DTO: { loginOrEmail: string; password: string };
    statusCode?: number;
  }) {
    const response = await request(this.app.getHttpServer())
      .post('/auth/login')
      .send(params.DTO)
      .expect(params.statusCode ?? HttpStatus.OK);

    return { accessToken: response.body.accessToken };
  }

  async me(params: { accessToken: string; statusCode?: number }) {
    const response = await request(this.app.getHttpServer())
      .get('/auth/me')
      .auth(params.accessToken, { type: 'bearer' })
      .expect(params.statusCode ?? HttpStatus.OK);

    return response.body;
  }

  async createAndLoginManyUsers(count: number) {
    const users = await this.createManyUsers(count);

    const loginPromises = users.map((user) =>
      this.login({
        DTO: { loginOrEmail: user.login, password: this.DEFAULT_PASSWORD },
      }),
    );

    return await Promise.all(loginPromises);
  }
}
