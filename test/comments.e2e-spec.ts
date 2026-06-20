import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import request from 'supertest';

import { AppModule } from '../src/app/app.module';
import { Comment } from '../src/modules/blogger-platform/domain/comment.entity';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const clearDb = (app: INestApplication) =>
  request(app.getHttpServer()).delete('/testing/all-data');

const createBlogViaApi = (app: INestApplication) =>
  request(app.getHttpServer()).post('/blogs').send({
    name: 'Test Blog',
    description: 'Test description',
    websiteUrl: 'https://test.com',
  });

const createPostViaApi = (app: INestApplication, blogId: string) =>
  request(app.getHttpServer()).post('/posts').send({
    title: 'Test Post',
    shortDescription: 'Test short description',
    content: 'Test content',
    blogId,
  });

const createCommentInDb = (
  commentModel: Model<Comment>,
  postId: string,
  override: Partial<Pick<Comment, 'content' | 'userId' | 'userLogin'>> = {},
) =>
  commentModel.create({
    postId,
    content: 'Test comment content',
    userId: 'user-id-1',
    userLogin: 'testuser',
    ...override,
  });

// ─── Shape matchers ───────────────────────────────────────────────────────────

const commentShape = (override: Record<string, unknown> = {}) =>
  expect.objectContaining({
    id: expect.any(String),
    content: expect.any(String),
    createdAt: expect.any(String),
    commentatorInfo: expect.objectContaining({
      userId: expect.any(String),
      userLogin: expect.any(String),
    }),
    likesInfo: {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None',
    },
    ...override,
  });

const paginatedShape = (itemsMatcher: unknown) =>
  expect.objectContaining({
    page: expect.any(Number),
    pageSize: expect.any(Number),
    pagesCount: expect.any(Number),
    totalCount: expect.any(Number),
    items: itemsMatcher,
  });

// ─── GET /comments/:id ────────────────────────────────────────────────────────

describe('Comments API (e2e)', () => {
  let app: INestApplication;
  let commentModel: Model<Comment>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    commentModel = app.get<Model<Comment>>(getModelToken(Comment.name));
  });

  afterAll(async () => {
    await clearDb(app);
    await app.close();
  });

  beforeEach(async () => {
    await clearDb(app);
    await commentModel.deleteMany();
  });

  describe('GET /comments/:id — получение комментария по id', () => {
    it('должен вернуть комментарий по корректному id', async () => {
      const blogRes = await createBlogViaApi(app).expect(201);
      const postRes = await createPostViaApi(app, blogRes.body.id).expect(201);
      const postId = postRes.body.id;

      const comment = await createCommentInDb(commentModel, postId, {
        content: 'My comment',
        userId: 'user-42',
        userLogin: 'john',
      });
      const commentId = comment._id.toString();

      const res = await request(app.getHttpServer())
        .get(`/comments/${commentId}`)
        .expect(200);

      expect(res.body).toEqual(
        commentShape({
          id: commentId,
          content: 'My comment',
          commentatorInfo: expect.objectContaining({
            userId: 'user-42',
            userLogin: 'john',
          }),
        }),
      );
    });

    it('createdAt должен быть валидной ISO-строкой', async () => {
      const blogRes = await createBlogViaApi(app).expect(201);
      const postRes = await createPostViaApi(app, blogRes.body.id).expect(201);

      const comment = await createCommentInDb(commentModel, postRes.body.id);

      const res = await request(app.getHttpServer())
        .get(`/comments/${comment._id.toString()}`)
        .expect(200);

      expect(new Date(res.body.createdAt).toString()).not.toBe('Invalid Date');
    });

    it('должен вернуть 404 если комментарий не существует', async () => {
      await request(app.getHttpServer())
        .get('/comments/507f1f77bcf86cd799439011')
        .expect(404);
    });
  });
});

// ─── GET /posts/:id/comments ──────────────────────────────────────────────────

describe('Posts → Comments API (e2e)', () => {
  let app: INestApplication;
  let commentModel: Model<Comment>;
  let blogId: string;
  let postId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    commentModel = app.get<Model<Comment>>(getModelToken(Comment.name));
  });

  afterAll(async () => {
    await clearDb(app);
    await app.close();
  });

  beforeEach(async () => {
    await clearDb(app);
    await commentModel.deleteMany();

    const blogRes = await createBlogViaApi(app).expect(201);
    blogId = blogRes.body.id;

    const postRes = await createPostViaApi(app, blogId).expect(201);
    postId = postRes.body.id;
  });

  describe('базовое поведение', () => {
    it('должен вернуть 200 и пустой список, если комментариев нет', async () => {
      const res = await request(app.getHttpServer())
        .get(`/posts/${postId}/comments`)
        .expect(200);

      expect(res.body).toEqual(paginatedShape([]));
      expect(res.body.totalCount).toBe(0);
      expect(res.body.items).toHaveLength(0);
    });

    it('должен вернуть комментарии с корректной структурой', async () => {
      await createCommentInDb(commentModel, postId);
      await createCommentInDb(commentModel, postId);

      const res = await request(app.getHttpServer())
        .get(`/posts/${postId}/comments`)
        .expect(200);

      expect(res.body.totalCount).toBe(2);
      expect(res.body.items).toHaveLength(2);
      expect(res.body.items[0]).toEqual(commentShape());
    });

    it('должен возвращать только комментарии нужного поста', async () => {
      const post2Res = await createPostViaApi(app, blogId).expect(201);
      const post2Id = post2Res.body.id;

      await createCommentInDb(commentModel, postId);
      await createCommentInDb(commentModel, postId);
      await createCommentInDb(commentModel, post2Id);

      const res = await request(app.getHttpServer())
        .get(`/posts/${postId}/comments`)
        .expect(200);

      expect(res.body.totalCount).toBe(2);
      res.body.items.forEach((c: { id: string }) => {
        expect(c).toEqual(commentShape());
      });
    });

    it('должен вернуть 404 если пост не существует', async () => {
      await request(app.getHttpServer())
        .get('/posts/507f1f77bcf86cd799439011/comments')
        .expect(404);
    });
  });

  describe('пагинация', () => {
    beforeEach(async () => {
      for (let i = 1; i <= 5; i++) {
        await createCommentInDb(commentModel, postId, {
          content: `Comment ${i}`,
        });
      }
    });

    it('должен использовать pageSize=10 и pageNumber=1 по умолчанию', async () => {
      for (let i = 6; i <= 12; i++) {
        await createCommentInDb(commentModel, postId, {
          content: `Comment ${i}`,
        });
      }

      const res = await request(app.getHttpServer())
        .get(`/posts/${postId}/comments`)
        .expect(200);

      expect(res.body.items).toHaveLength(10);
      expect(res.body.page).toBe(1);
      expect(res.body.pageSize).toBe(10);
      expect(res.body.totalCount).toBe(12);
      expect(res.body.pagesCount).toBe(2);
    });

    it('должен вернуть первую страницу с нужным количеством элементов', async () => {
      const res = await request(app.getHttpServer())
        .get(`/posts/${postId}/comments?pageSize=2&pageNumber=1`)
        .expect(200);

      expect(res.body.items).toHaveLength(2);
      expect(res.body.page).toBe(1);
      expect(res.body.pageSize).toBe(2);
      expect(res.body.totalCount).toBe(5);
      expect(res.body.pagesCount).toBe(3);
    });

    it('должен вернуть вторую страницу', async () => {
      const res = await request(app.getHttpServer())
        .get(`/posts/${postId}/comments?pageSize=2&pageNumber=2`)
        .expect(200);

      expect(res.body.items).toHaveLength(2);
      expect(res.body.page).toBe(2);
    });

    it('должен вернуть пустой items для страницы за пределами диапазона', async () => {
      const res = await request(app.getHttpServer())
        .get(`/posts/${postId}/comments?pageSize=2&pageNumber=99`)
        .expect(200);

      expect(res.body.items).toHaveLength(0);
      expect(res.body.totalCount).toBe(5);
    });
  });

  describe('сортировка', () => {
    it('должен сортировать по createdAt desc по умолчанию', async () => {
      await createCommentInDb(commentModel, postId, { content: 'First' });
      await createCommentInDb(commentModel, postId, { content: 'Second' });
      await createCommentInDb(commentModel, postId, { content: 'Third' });

      const res = await request(app.getHttpServer())
        .get(`/posts/${postId}/comments`)
        .expect(200);

      const contents = res.body.items.map(
        (c: { content: string }) => c.content,
      );
      expect(contents).toEqual(['Third', 'Second', 'First']);
    });

    it('должен сортировать по createdAt asc', async () => {
      await createCommentInDb(commentModel, postId, { content: 'First' });
      await createCommentInDb(commentModel, postId, { content: 'Second' });
      await createCommentInDb(commentModel, postId, { content: 'Third' });

      const res = await request(app.getHttpServer())
        .get(`/posts/${postId}/comments?sortBy=createdAt&sortDirection=asc`)
        .expect(200);

      const contents = res.body.items.map(
        (c: { content: string }) => c.content,
      );
      expect(contents).toEqual(['First', 'Second', 'Third']);
    });
  });
});
