import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { HttpStatus, INestApplication } from '@nestjs/common';

import { UsersTestingManager } from './helpers/users-testing-manager';
import { initSettings } from './helpers/init-settings';
import { deleteAllData } from './helpers/delete-all-data';
import { CreateUserInputDto } from 'modules/user-accounts/api/input-dto/create-user.input-dto';
import { EmailService } from 'modules/notifications/application/email.service';

describe('users', () => {
  let app: INestApplication;
  let usersTestingManager: UsersTestingManager;

  beforeAll(async () => {
    const result = await initSettings((moduleBuilder) =>
      moduleBuilder.overrideProvider(JwtService).useValue(
        new JwtService({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: '2s' },
        }),
      ),
    );

    app = result.app;
    usersTestingManager = result.userTestManager;
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('Пользователь создается корректно', async () => {
    const body: CreateUserInputDto = {
      login: 'name',
      password: 'qwerty',
      email: 'email@mail.ru',
    };

    const response = await usersTestingManager.createUser({ DTO: body });

    expect(response).toEqual({
      id: expect.any(String),
      login: body.login,
      email: body.email,
      createdAt: expect.any(String),
    });
  });

  it('Получение пользователе с пагинацией', async () => {
    await usersTestingManager.createManyUsers(12);

    const response = await request(app.getHttpServer())
      .get('/users?pageNumber=2&sortDirection=asc')
      .auth(process.env.BASIC_USERNAME ?? '', process.env.BASIC_PASSWORD ?? '')
      .expect(HttpStatus.OK);

    expect(response.body.totalCount).toBe(12);
    expect(response.body.items).toHaveLength(2);
    expect(response.body.pagesCount).toBe(2);
  });

  it('Если передан коррентный accessToken - вернет информацию о пользователе', async () => {
    const tokens = await usersTestingManager.createAndLoginManyUsers(1);

    const response = await usersTestingManager.me({
      accessToken: tokens[0].accessToken,
    });

    expect(response).toEqual({
      login: expect.any(String),
      email: expect.any(String),
      userId: expect.any(String),
    });
  });

  it('Должен вернуть Unauthorized для протухшего токена', async () => {
    const tokens = await usersTestingManager.createAndLoginManyUsers(1);

    await new Promise((resolve) => setTimeout(resolve, 3_000));

    await usersTestingManager.me({
      accessToken: tokens[0].accessToken,
      statusCode: HttpStatus.UNAUTHORIZED,
    });
  });

  it('Пользователь успешно создается', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration')
      .send({
        email: 'email@email.em',
        password: '123123123',
        login: 'login123',
      })
      .expect(HttpStatus.NO_CONTENT);
  });

  it(`Отправка email вызывается при регистрации пользователя`, async () => {
    const sendEmailMethod = (app.get(EmailService).sendConfirmationEmail = jest
      .fn()
      .mockImplementation(() => Promise.resolve()));

    await request(app.getHttpServer())
      .post('/auth/registration')
      .send({
        email: 'email@email.em',
        password: '123123123',
        login: 'login123',
      })
      .expect(HttpStatus.NO_CONTENT);

    expect(sendEmailMethod).toHaveBeenCalled();
  });
});
