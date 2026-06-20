// import { Test, TestingModule } from '@nestjs/testing';
// import { INestApplication } from '@nestjs/common';
// import request from 'supertest';
// import { getModelToken } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
//
// import { AppModule } from '../src/app/app.module';
// import { User } from '../src/modules/user-accounts/domain/user.entity';
//
// // Очистка БД через тестовый эндпоинт
// const clearDb = (app: INestApplication) =>
//   request(app.getHttpServer()).delete('/testing/all-data');
//
// // Вспомогательная функция для создания пользователя через API
// const createUserViaApi = (
//   app: INestApplication,
//   override: Partial<{ login: string; email: string; password: string }> = {},
// ) => {
//   const defaults = {
//     login: 'testuser',
//     email: 'test@example.com',
//     password: 'password123',
//   };
//   return request(app.getHttpServer())
//     .post('/users')
//     .send({ ...defaults, ...override });
// };
//
// describe('Users API (e2e)', () => {
//   let app: INestApplication;
//   let userModel: Model<User>;
//
//   beforeAll(async () => {
//     const moduleFixture: TestingModule = await Test.createTestingModule({
//       imports: [AppModule],
//     }).compile();
//
//     app = moduleFixture.createNestApplication();
//     await app.init();
//
//     userModel = moduleFixture.get<Model<User>>(getModelToken(User.name));
//   });
//
//   afterAll(async () => {
//     await clearDb(app);
//     await app.close();
//   });
//
//   beforeEach(async () => {
//     await clearDb(app);
//   });
//
//   // ─── POST /users ──────────────────────────────────────────────────────────
//
//   describe('POST /users — создание пользователя', () => {
//     it('должен вернуть 201 и данные созданного пользователя', async () => {
//       const response = await createUserViaApi(app).expect(201);
//
//       expect(response.body).toEqual({
//         id: expect.any(String),
//         login: 'testuser',
//         email: 'test@example.com',
//         createdAt: expect.any(String),
//       });
//     });
//
//     it('createdAt должен быть валидной ISO-строкой', async () => {
//       const response = await createUserViaApi(app).expect(201);
//
//       const date = new Date(response.body.createdAt);
//       expect(date.toString()).not.toBe('Invalid Date');
//     });
//
//     it('не должен возвращать пароль в ответе', async () => {
//       const response = await createUserViaApi(app).expect(201);
//
//       expect(response.body.password).toBeUndefined();
//     });
//
//     it('должен хранить хэш пароля в БД, а не plain-text', async () => {
//       await createUserViaApi(app).expect(201);
//
//       const userInDb = await userModel.findOne({ login: 'testuser' }).lean();
//       expect(userInDb).not.toBeNull();
//       expect(userInDb!.password).not.toBe('password123');
//       // bcrypt хэш всегда начинается с $2
//       expect(userInDb!.password).toMatch(/^\$2[aby]\$/);
//     });
//
//     it('должен корректно сохранять несколько пользователей', async () => {
//       await createUserViaApi(app, {
//         login: 'alice',
//         email: 'alice@example.com',
//       }).expect(201);
//       await createUserViaApi(app, {
//         login: 'bob',
//         email: 'bob@example.com',
//       }).expect(201);
//
//       const count = await userModel.countDocuments();
//       expect(count).toBe(2);
//     });
//   });
//
//   // ─── GET /users ───────────────────────────────────────────────────────────
//
//   describe('GET /users — получение списка пользователей', () => {
//     describe('базовое поведение', () => {
//       it('должен вернуть 200 и пустой список, если пользователей нет', async () => {
//         const response = await request(app.getHttpServer())
//           .get('/users')
//           .expect(200);
//
//         expect(response.body).toEqual({
//           page: expect.any(Number),
//           pageSize: expect.any(Number),
//           pagesCount: expect.any(Number),
//           totalCount: 0,
//           items: [],
//         });
//       });
//
//       it('должен вернуть всех пользователей с корректной структурой', async () => {
//         await createUserViaApi(app, {
//           login: 'alice',
//           email: 'alice@example.com',
//         });
//         await createUserViaApi(app, {
//           login: 'bob',
//           email: 'bob@example.com',
//         });
//
//         const response = await request(app.getHttpServer())
//           .get('/users')
//           .expect(200);
//
//         expect(response.body.totalCount).toBe(2);
//         expect(response.body.items).toHaveLength(2);
//         expect(response.body.items[0]).toEqual(
//           expect.objectContaining({
//             id: expect.any(String),
//             login: expect.any(String),
//             email: expect.any(String),
//             createdAt: expect.any(String),
//           }),
//         );
//       });
//
//       it('не должен возвращать пароль в items', async () => {
//         await createUserViaApi(app);
//
//         const response = await request(app.getHttpServer())
//           .get('/users')
//           .expect(200);
//
//         const item = response.body.items[0];
//         expect(item.password).toBeUndefined();
//       });
//     });
//
//     describe('пагинация', () => {
//       beforeEach(async () => {
//         // Создаём 5 пользователей для тестов пагинации
//         for (let i = 1; i <= 5; i++) {
//           await createUserViaApi(app, {
//             login: `user${i}`,
//             email: `user${i}@example.com`,
//           });
//         }
//       });
//
//       it('должен вернуть первую страницу с нужным количеством элементов', async () => {
//         const response = await request(app.getHttpServer())
//           .get('/users?pageSize=2&pageNumber=1')
//           .expect(200);
//
//         expect(response.body.items).toHaveLength(2);
//         expect(response.body.page).toBe(1);
//         expect(response.body.pageSize).toBe(2);
//         expect(response.body.totalCount).toBe(5);
//         expect(response.body.pagesCount).toBe(3);
//       });
//
//       it('должен вернуть вторую страницу', async () => {
//         const response = await request(app.getHttpServer())
//           .get('/users?pageSize=2&pageNumber=2')
//           .expect(200);
//
//         expect(response.body.items).toHaveLength(2);
//         expect(response.body.page).toBe(2);
//       });
//
//       it('должен вернуть последнюю неполную страницу', async () => {
//         const response = await request(app.getHttpServer())
//           .get('/users?pageSize=2&pageNumber=3')
//           .expect(200);
//
//         expect(response.body.items).toHaveLength(1);
//         expect(response.body.page).toBe(3);
//         expect(response.body.pagesCount).toBe(3);
//       });
//
//       it('должен вернуть пустой items для страницы за пределами диапазона', async () => {
//         const response = await request(app.getHttpServer())
//           .get('/users?pageSize=2&pageNumber=99')
//           .expect(200);
//
//         expect(response.body.items).toHaveLength(0);
//         expect(response.body.totalCount).toBe(5);
//       });
//     });
//
//     describe('сортировка', () => {
//       beforeEach(async () => {
//         await createUserViaApi(app, {
//           login: 'charlie',
//           email: 'charlie@example.com',
//         });
//         await createUserViaApi(app, {
//           login: 'alice',
//           email: 'alice@example.com',
//         });
//         await createUserViaApi(app, {
//           login: 'bob',
//           email: 'bob@example.com',
//         });
//       });
//
//       it('должен сортировать по login asc', async () => {
//         const response = await request(app.getHttpServer())
//           .get('/users?sortBy=login&sortDirection=asc')
//           .expect(200);
//
//         const logins = response.body.items.map(
//           (u: { login: string }) => u.login,
//         );
//         expect(logins).toEqual(['alice', 'bob', 'charlie']);
//       });
//
//       it('должен сортировать по login desc', async () => {
//         const response = await request(app.getHttpServer())
//           .get('/users?sortBy=login&sortDirection=desc')
//           .expect(200);
//
//         const logins = response.body.items.map(
//           (u: { login: string }) => u.login,
//         );
//         expect(logins).toEqual(['charlie', 'bob', 'alice']);
//       });
//
//       it('должен сортировать по email asc', async () => {
//         const response = await request(app.getHttpServer())
//           .get('/users?sortBy=email&sortDirection=asc')
//           .expect(200);
//
//         const emails = response.body.items.map(
//           (u: { email: string }) => u.email,
//         );
//         expect(emails).toEqual([
//           'alice@example.com',
//           'bob@example.com',
//           'charlie@example.com',
//         ]);
//       });
//     });
//
//     describe('фильтрация (searchLoginTerm / searchEmailTerm)', () => {
//       beforeEach(async () => {
//         await createUserViaApi(app, {
//           login: 'alice',
//           email: 'alice@example.com',
//         });
//         await createUserViaApi(app, {
//           login: 'bob',
//           email: 'bob@example.com',
//         });
//         await createUserViaApi(app, {
//           login: 'charlie',
//           email: 'charlie@example.com',
//         });
//       });
//
//       it('должен фильтровать по searchLoginTerm (точное совпадение)', async () => {
//         const response = await request(app.getHttpServer())
//           .get('/users?searchLoginTerm=alice')
//           .expect(200);
//
//         expect(response.body.totalCount).toBe(1);
//         expect(response.body.items[0].login).toBe('alice');
//       });
//
//       it('должен фильтровать по searchEmailTerm (точное совпадение)', async () => {
//         const response = await request(app.getHttpServer())
//           .get('/users?searchEmailTerm=bob@example.com')
//           .expect(200);
//
//         expect(response.body.totalCount).toBe(1);
//         expect(response.body.items[0].email).toBe('bob@example.com');
//       });
//
//       it('должен вернуть пустой список, если ничего не найдено по login', async () => {
//         const response = await request(app.getHttpServer())
//           .get('/users?searchLoginTerm=nonexistent')
//           .expect(200);
//
//         expect(response.body.totalCount).toBe(0);
//         expect(response.body.items).toHaveLength(0);
//       });
//
//       it('должен найти по login ИЛИ email при передаче обоих параметров', async () => {
//         // alice по login, bob по email — оба должны вернуться
//         const response = await request(app.getHttpServer())
//           .get('/users?searchLoginTerm=alice&searchEmailTerm=bob@example.com')
//           .expect(200);
//
//         expect(response.body.totalCount).toBe(2);
//         const logins = response.body.items.map((u: { login: string }) => u.login);
//         expect(logins).toEqual(expect.arrayContaining(['alice', 'bob']));
//       });
//     });
//   });
//
//   // ─── DELETE /users/:id ────────────────────────────────────────────────────
//
//   describe('DELETE /users/:id — удаление пользователя', () => {
//     it('должен вернуть 204 при успешном удалении', async () => {
//       const createResponse = await createUserViaApi(app).expect(201);
//       const { id } = createResponse.body;
//
//       await request(app.getHttpServer()).delete(`/users/${id}`).expect(204);
//     });
//
//     it('тело ответа должно быть пустым при удалении', async () => {
//       const createResponse = await createUserViaApi(app).expect(201);
//       const { id } = createResponse.body;
//
//       const deleteResponse = await request(app.getHttpServer())
//         .delete(`/users/${id}`)
//         .expect(204);
//
//       expect(deleteResponse.body).toEqual({});
//     });
//
//     it('пользователь должен исчезнуть из БД после удаления', async () => {
//       const createResponse = await createUserViaApi(app).expect(201);
//       const { id } = createResponse.body;
//
//       await request(app.getHttpServer()).delete(`/users/${id}`).expect(204);
//
//       const userInDb = await userModel.findById(id).lean();
//       expect(userInDb).toBeNull();
//     });
//
//     it('должен вернуть 404, если пользователь не существует', async () => {
//       const nonExistentId = '507f1f77bcf86cd799439011';
//
//       await request(app.getHttpServer())
//         .delete(`/users/${nonExistentId}`)
//         .expect(404);
//     });
//
//     it('должен вернуть 404 при повторном удалении уже удалённого пользователя', async () => {
//       const createResponse = await createUserViaApi(app).expect(201);
//       const { id } = createResponse.body;
//
//       await request(app.getHttpServer()).delete(`/users/${id}`).expect(204);
//
//       // Повторный запрос — пользователь уже удалён
//       await request(app.getHttpServer()).delete(`/users/${id}`).expect(404);
//     });
//
//     it('не должен влиять на других пользователей при удалении', async () => {
//       const res1 = await createUserViaApi(app, {
//         login: 'alice',
//         email: 'alice@example.com',
//       }).expect(201);
//       await createUserViaApi(app, {
//         login: 'bob',
//         email: 'bob@example.com',
//       }).expect(201);
//
//       await request(app.getHttpServer())
//         .delete(`/users/${res1.body.id}`)
//         .expect(204);
//
//       const remaining = await request(app.getHttpServer())
//         .get('/users')
//         .expect(200);
//
//       expect(remaining.body.totalCount).toBe(1);
//       expect(remaining.body.items[0].login).toBe('bob');
//     });
//   });
// });

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
