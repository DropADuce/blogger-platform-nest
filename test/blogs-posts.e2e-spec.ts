import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { AppModule } from '../src/app/app.module';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const clearDb = (app: INestApplication) =>
  request(app.getHttpServer()).delete('/testing/all-data');

const createBlogViaApi = (
  app: INestApplication,
  override: Partial<{
    name: string;
    description: string;
    websiteUrl: string;
  }> = {},
) => {
  const defaults = {
    name: 'Test Blog',
    description: 'Test description',
    websiteUrl: 'https://test.com',
  };
  return request(app.getHttpServer())
    .post('/blogs')
    .send({ ...defaults, ...override });
};

const createPostViaApi = (
  app: INestApplication,
  blogId: string,
  override: Partial<{
    title: string;
    shortDescription: string;
    content: string;
  }> = {},
) => {
  const defaults = {
    title: 'Test Post',
    shortDescription: 'Test short description',
    content: 'Test content',
  };
  return request(app.getHttpServer())
    .post('/posts')
    .send({ ...defaults, ...override, blogId });
};

// ─── Shape matchers ───────────────────────────────────────────────────────────

const blogShape = (override: Record<string, unknown> = {}) =>
  expect.objectContaining({
    id: expect.any(String),
    name: expect.any(String),
    description: expect.any(String),
    websiteUrl: expect.any(String),
    createdAt: expect.any(String),
    isMembership: expect.any(Boolean),
    ...override,
  });

const postShape = (override: Record<string, unknown> = {}) =>
  expect.objectContaining({
    id: expect.any(String),
    title: expect.any(String),
    shortDescription: expect.any(String),
    content: expect.any(String),
    blogId: expect.any(String),
    blogName: expect.any(String),
    createdAt: expect.any(String),
    extendedLikesInfo: {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None',
      newestLikes: [],
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

// ─── Blogs ───────────────────────────────────────────────────────────────────

describe('Blogs API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await clearDb(app);
    await app.close();
  });

  beforeEach(async () => {
    await clearDb(app);
  });

  // ─── POST /blogs ────────────────────────────────────────────────────────────

  describe('POST /blogs — создание блога', () => {
    it('должен вернуть 201 и данные созданного блога', async () => {
      const res = await createBlogViaApi(app).expect(201);

      expect(res.body).toEqual(
        blogShape({
          name: 'Test Blog',
          description: 'Test description',
          websiteUrl: 'https://test.com',
          isMembership: false,
        }),
      );
    });

    it('createdAt должен быть валидной ISO-строкой', async () => {
      const res = await createBlogViaApi(app).expect(201);

      expect(new Date(res.body.createdAt).toString()).not.toBe('Invalid Date');
    });
  });

  // ─── GET /blogs ─────────────────────────────────────────────────────────────

  describe('GET /blogs — список блогов', () => {
    describe('базовое поведение', () => {
      it('должен вернуть 200 и пустой список, если блогов нет', async () => {
        const res = await request(app.getHttpServer())
          .get('/blogs')
          .expect(200);

        expect(res.body).toEqual(paginatedShape(expect.arrayContaining([])));
        expect(res.body.totalCount).toBe(0);
        expect(res.body.items).toHaveLength(0);
      });

      it('должен вернуть все блоги с корректной структурой', async () => {
        await createBlogViaApi(app, { name: 'Blog A' });
        await createBlogViaApi(app, { name: 'Blog B' });

        const res = await request(app.getHttpServer())
          .get('/blogs')
          .expect(200);

        expect(res.body.totalCount).toBe(2);
        expect(res.body.items).toHaveLength(2);
        expect(res.body.items[0]).toEqual(blogShape());
      });
    });

    describe('пагинация', () => {
      beforeEach(async () => {
        for (let i = 1; i <= 5; i++) {
          await createBlogViaApi(app, { name: `Blog ${i}` });
        }
      });

      it('должен использовать pageSize=10 и pageNumber=1 по умолчанию', async () => {
        // Добавляем ещё 7 блогов — итого 12
        for (let i = 6; i <= 12; i++) {
          await createBlogViaApi(app, { name: `Blog ${i}` });
        }

        const res = await request(app.getHttpServer())
          .get('/blogs')
          .expect(200);

        expect(res.body.items).toHaveLength(10);
        expect(res.body.page).toBe(1);
        expect(res.body.pageSize).toBe(10);
        expect(res.body.totalCount).toBe(12);
        expect(res.body.pagesCount).toBe(2);
      });

      it('должен вернуть первую страницу с нужным количеством элементов', async () => {
        const res = await request(app.getHttpServer())
          .get('/blogs?pageSize=2&pageNumber=1')
          .expect(200);

        expect(res.body.items).toHaveLength(2);
        expect(res.body.page).toBe(1);
        expect(res.body.pageSize).toBe(2);
        expect(res.body.totalCount).toBe(5);
        expect(res.body.pagesCount).toBe(3);
      });

      it('должен вернуть вторую страницу', async () => {
        const res = await request(app.getHttpServer())
          .get('/blogs?pageSize=2&pageNumber=2')
          .expect(200);

        expect(res.body.items).toHaveLength(2);
        expect(res.body.page).toBe(2);
      });

      it('должен вернуть последнюю неполную страницу', async () => {
        const res = await request(app.getHttpServer())
          .get('/blogs?pageSize=2&pageNumber=3')
          .expect(200);

        expect(res.body.items).toHaveLength(1);
      });

      it('должен вернуть пустой items для страницы за пределами диапазона', async () => {
        const res = await request(app.getHttpServer())
          .get('/blogs?pageSize=2&pageNumber=99')
          .expect(200);

        expect(res.body.items).toHaveLength(0);
        expect(res.body.totalCount).toBe(5);
      });
    });

    describe('сортировка', () => {
      beforeEach(async () => {
        await createBlogViaApi(app, { name: 'Charlie' });
        await createBlogViaApi(app, { name: 'Alice' });
        await createBlogViaApi(app, { name: 'Bob' });
      });

      it('должен сортировать по name asc', async () => {
        const res = await request(app.getHttpServer())
          .get('/blogs?sortBy=name&sortDirection=asc')
          .expect(200);

        const names = res.body.items.map((b: { name: string }) => b.name);
        expect(names).toEqual(['Alice', 'Bob', 'Charlie']);
      });

      it('должен сортировать по name desc', async () => {
        const res = await request(app.getHttpServer())
          .get('/blogs?sortBy=name&sortDirection=desc')
          .expect(200);

        const names = res.body.items.map((b: { name: string }) => b.name);
        expect(names).toEqual(['Charlie', 'Bob', 'Alice']);
      });
    });

    describe('фильтрация (searchNameTerm)', () => {
      beforeEach(async () => {
        await createBlogViaApi(app, { name: 'Angular Blog' });
        await createBlogViaApi(app, { name: 'React Blog' });
        await createBlogViaApi(app, { name: 'Vue Notes' });
      });

      it('должен найти блоги по частичному совпадению имени', async () => {
        const res = await request(app.getHttpServer())
          .get('/blogs?searchNameTerm=Blog')
          .expect(200);

        expect(res.body.totalCount).toBe(2);
        const names = res.body.items.map((b: { name: string }) => b.name);
        expect(names).toEqual(
          expect.arrayContaining(['Angular Blog', 'React Blog']),
        );
      });

      it('поиск нечувствителен к регистру', async () => {
        const res = await request(app.getHttpServer())
          .get('/blogs?searchNameTerm=blog')
          .expect(200);

        expect(res.body.totalCount).toBe(2);
      });

      it('должен вернуть пустой список если ничего не найдено', async () => {
        const res = await request(app.getHttpServer())
          .get('/blogs?searchNameTerm=nonexistent')
          .expect(200);

        expect(res.body.totalCount).toBe(0);
        expect(res.body.items).toHaveLength(0);
      });
    });
  });

  // ─── GET /blogs/:id ─────────────────────────────────────────────────────────

  describe('GET /blogs/:id — получение блога по id', () => {
    it('должен вернуть блог по корректному id', async () => {
      const createRes = await createBlogViaApi(app, { name: 'My Blog' }).expect(
        201,
      );
      const { id } = createRes.body;

      const res = await request(app.getHttpServer())
        .get(`/blogs/${id}`)
        .expect(200);

      expect(res.body).toEqual(blogShape({ id, name: 'My Blog' }));
    });

    it('должен вернуть 404 если блог не существует', async () => {
      await request(app.getHttpServer())
        .get('/blogs/507f1f77bcf86cd799439011')
        .expect(404);
    });
  });

  // ─── PUT /blogs/:id ─────────────────────────────────────────────────────────

  describe('PUT /blogs/:id — обновление блога', () => {
    it('должен вернуть 204 и обновить данные блога', async () => {
      const createRes = await createBlogViaApi(app).expect(201);
      const { id } = createRes.body;

      await request(app.getHttpServer())
        .put(`/blogs/${id}`)
        .send({
          name: 'Updated Blog',
          description: 'Updated description',
          websiteUrl: 'https://updated.com',
        })
        .expect(204);

      const getRes = await request(app.getHttpServer())
        .get(`/blogs/${id}`)
        .expect(200);

      expect(getRes.body).toEqual(
        blogShape({
          name: 'Updated Blog',
          description: 'Updated description',
          websiteUrl: 'https://updated.com',
        }),
      );
    });

    it('должен обновить blogName во всех постах блога при переименовании', async () => {
      const blogRes = await createBlogViaApi(app, { name: 'Old Name' }).expect(
        201,
      );
      const blogId = blogRes.body.id;

      const postRes = await createPostViaApi(app, blogId).expect(201);
      expect(postRes.body.blogName).toBe('Old Name');

      await request(app.getHttpServer())
        .put(`/blogs/${blogId}`)
        .send({
          name: 'New Name',
          description: 'desc',
          websiteUrl: 'https://test.com',
        })
        .expect(204);

      const updatedPost = await request(app.getHttpServer())
        .get(`/posts/${postRes.body.id}`)
        .expect(200);

      expect(updatedPost.body.blogName).toBe('New Name');
    });

    it('должен вернуть 404 если блог не существует', async () => {
      await request(app.getHttpServer())
        .put('/blogs/507f1f77bcf86cd799439011')
        .send({
          name: 'x',
          description: 'x',
          websiteUrl: 'https://x.com',
        })
        .expect(404);
    });
  });

  // ─── DELETE /blogs/:id ──────────────────────────────────────────────────────

  describe('DELETE /blogs/:id — удаление блога', () => {
    it('должен вернуть 204 при успешном удалении', async () => {
      const createRes = await createBlogViaApi(app).expect(201);
      const { id } = createRes.body;

      await request(app.getHttpServer()).delete(`/blogs/${id}`).expect(204);
    });

    it('блог должен исчезнуть после удаления', async () => {
      const createRes = await createBlogViaApi(app).expect(201);
      const { id } = createRes.body;

      await request(app.getHttpServer()).delete(`/blogs/${id}`).expect(204);

      await request(app.getHttpServer()).get(`/blogs/${id}`).expect(404);
    });

    it('должен вернуть 404 если блог не существует', async () => {
      await request(app.getHttpServer())
        .delete('/blogs/507f1f77bcf86cd799439011')
        .expect(404);
    });

    it('должен вернуть 404 при повторном удалении', async () => {
      const createRes = await createBlogViaApi(app).expect(201);
      const { id } = createRes.body;

      await request(app.getHttpServer()).delete(`/blogs/${id}`).expect(204);
      await request(app.getHttpServer()).delete(`/blogs/${id}`).expect(404);
    });
  });

  // ─── GET /blogs/:id/posts ───────────────────────────────────────────────────

  describe('GET /blogs/:id/posts — посты блога', () => {
    it('должен вернуть пустой список если у блога нет постов', async () => {
      const blogRes = await createBlogViaApi(app).expect(201);

      const res = await request(app.getHttpServer())
        .get(`/blogs/${blogRes.body.id}/posts`)
        .expect(200);

      expect(res.body.totalCount).toBe(0);
      expect(res.body.items).toHaveLength(0);
    });

    it('должен вернуть только посты нужного блога', async () => {
      const blog1Res = await createBlogViaApi(app, { name: 'Blog 1' }).expect(
        201,
      );
      const blog2Res = await createBlogViaApi(app, { name: 'Blog 2' }).expect(
        201,
      );

      await createPostViaApi(app, blog1Res.body.id, {
        title: 'Post for Blog 1',
      });
      await createPostViaApi(app, blog1Res.body.id, {
        title: 'Post for Blog 1 #2',
      });
      await createPostViaApi(app, blog2Res.body.id, {
        title: 'Post for Blog 2',
      });

      const res = await request(app.getHttpServer())
        .get(`/blogs/${blog1Res.body.id}/posts`)
        .expect(200);

      expect(res.body.totalCount).toBe(2);
      expect(res.body.items).toHaveLength(2);
      res.body.items.forEach((post: { blogId: string }) => {
        expect(post.blogId).toBe(blog1Res.body.id);
      });
    });

    it('должен поддерживать пагинацию', async () => {
      const blogRes = await createBlogViaApi(app).expect(201);
      const blogId = blogRes.body.id;

      for (let i = 1; i <= 4; i++) {
        await createPostViaApi(app, blogId, { title: `Post ${i}` });
      }

      const res = await request(app.getHttpServer())
        .get(`/blogs/${blogId}/posts?pageSize=2&pageNumber=1`)
        .expect(200);

      expect(res.body.items).toHaveLength(2);
      expect(res.body.totalCount).toBe(4);
      expect(res.body.pagesCount).toBe(2);
    });

    it('должен вернуть пустой список для несуществующего blogId', async () => {
      const res = await request(app.getHttpServer())
        .get('/blogs/507f1f77bcf86cd799439011/posts')
        .expect(200);

      expect(res.body.totalCount).toBe(0);
      expect(res.body.items).toHaveLength(0);
    });
  });

  // ─── POST /blogs/:id/posts ──────────────────────────────────────────────────

  describe('POST /blogs/:id/posts — создание поста для блога', () => {
    it('должен создать пост и вернуть 201 с корректными данными', async () => {
      const blogRes = await createBlogViaApi(app, { name: 'My Blog' }).expect(
        201,
      );
      const blogId = blogRes.body.id;

      const res = await request(app.getHttpServer())
        .post(`/blogs/${blogId}/posts`)
        .send({
          title: 'New Post',
          shortDescription: 'Short',
          content: 'Content here',
        })
        .expect(201);

      expect(res.body).toEqual(
        postShape({
          title: 'New Post',
          blogId,
          blogName: 'My Blog',
        }),
      );
    });

    it('должен вернуть 404 если блог не существует', async () => {
      await request(app.getHttpServer())
        .post('/blogs/507f1f77bcf86cd799439011/posts')
        .send({
          title: 'Post',
          shortDescription: 'Short',
          content: 'Content',
        })
        .expect(404);
    });
  });
});

// ─── Posts ───────────────────────────────────────────────────────────────────

describe('Posts API (e2e)', () => {
  let app: INestApplication;
  let blogId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await clearDb(app);
    await app.close();
  });

  beforeEach(async () => {
    await clearDb(app);
    // Большинство тестов постов требуют существующий блог
    const blogRes = await createBlogViaApi(app).expect(201);
    blogId = blogRes.body.id;
  });

  // ─── POST /posts ────────────────────────────────────────────────────────────

  describe('POST /posts — создание поста', () => {
    it('должен вернуть 201 и данные созданного поста', async () => {
      const res = await createPostViaApi(app, blogId).expect(201);

      expect(res.body).toEqual(
        postShape({
          title: 'Test Post',
          shortDescription: 'Test short description',
          content: 'Test content',
          blogId,
        }),
      );
    });

    it('blogName должен соответствовать имени блога', async () => {
      const namedBlogRes = await createBlogViaApi(app, {
        name: 'Named Blog',
      }).expect(201);

      const res = await createPostViaApi(app, namedBlogRes.body.id).expect(201);

      expect(res.body.blogName).toBe('Named Blog');
    });

    it('createdAt должен быть валидной ISO-строкой', async () => {
      const res = await createPostViaApi(app, blogId).expect(201);

      expect(new Date(res.body.createdAt).toString()).not.toBe('Invalid Date');
    });

    it('extendedLikesInfo должен быть с нулевыми значениями по умолчанию', async () => {
      const res = await createPostViaApi(app, blogId).expect(201);

      expect(res.body.extendedLikesInfo).toEqual({
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      });
    });

    it('должен вернуть 404 если блог не существует', async () => {
      await createPostViaApi(app, '507f1f77bcf86cd799439011').expect(404);
    });
  });

  // ─── GET /posts ─────────────────────────────────────────────────────────────

  describe('GET /posts — список постов', () => {
    describe('базовое поведение', () => {
      it('должен вернуть 200 и пустой список если постов нет', async () => {
        const res = await request(app.getHttpServer())
          .get('/posts')
          .expect(200);

        expect(res.body.totalCount).toBe(0);
        expect(res.body.items).toHaveLength(0);
      });

      it('должен вернуть посты с корректной структурой', async () => {
        await createPostViaApi(app, blogId);
        await createPostViaApi(app, blogId);

        const res = await request(app.getHttpServer())
          .get('/posts')
          .expect(200);

        expect(res.body.totalCount).toBe(2);
        expect(res.body.items).toHaveLength(2);
        expect(res.body.items[0]).toEqual(postShape());
      });
    });

    describe('пагинация', () => {
      beforeEach(async () => {
        for (let i = 1; i <= 5; i++) {
          await createPostViaApi(app, blogId, { title: `Post ${i}` });
        }
      });

      it('должен использовать pageSize=10 и pageNumber=1 по умолчанию', async () => {
        // Добавляем ещё 7 постов — итого 12
        for (let i = 6; i <= 12; i++) {
          await createPostViaApi(app, blogId, { title: `Post ${i}` });
        }

        const res = await request(app.getHttpServer())
          .get('/posts')
          .expect(200);

        expect(res.body.items).toHaveLength(10);
        expect(res.body.page).toBe(1);
        expect(res.body.pageSize).toBe(10);
        expect(res.body.totalCount).toBe(12);
        expect(res.body.pagesCount).toBe(2);
      });

      it('должен вернуть первую страницу', async () => {
        const res = await request(app.getHttpServer())
          .get('/posts?pageSize=2&pageNumber=1')
          .expect(200);

        expect(res.body.items).toHaveLength(2);
        expect(res.body.page).toBe(1);
        expect(res.body.totalCount).toBe(5);
        expect(res.body.pagesCount).toBe(3);
      });

      it('должен вернуть пустой список за пределами диапазона', async () => {
        const res = await request(app.getHttpServer())
          .get('/posts?pageSize=2&pageNumber=99')
          .expect(200);

        expect(res.body.items).toHaveLength(0);
        expect(res.body.totalCount).toBe(5);
      });
    });

    describe('сортировка', () => {
      beforeEach(async () => {
        await createPostViaApi(app, blogId, { title: 'Charlie' });
        await createPostViaApi(app, blogId, { title: 'Alice' });
        await createPostViaApi(app, blogId, { title: 'Bob' });
      });

      it('должен сортировать по title asc', async () => {
        const res = await request(app.getHttpServer())
          .get('/posts?sortBy=title&sortDirection=asc')
          .expect(200);

        const titles = res.body.items.map((p: { title: string }) => p.title);
        expect(titles).toEqual(['Alice', 'Bob', 'Charlie']);
      });

      it('должен сортировать по title desc', async () => {
        const res = await request(app.getHttpServer())
          .get('/posts?sortBy=title&sortDirection=desc')
          .expect(200);

        const titles = res.body.items.map((p: { title: string }) => p.title);
        expect(titles).toEqual(['Charlie', 'Bob', 'Alice']);
      });
    });
  });

  // ─── GET /posts/:id ─────────────────────────────────────────────────────────

  describe('GET /posts/:id — получение поста по id', () => {
    it('должен вернуть пост по корректному id', async () => {
      const createRes = await createPostViaApi(app, blogId, {
        title: 'My Post',
      }).expect(201);
      const { id } = createRes.body;

      const res = await request(app.getHttpServer())
        .get(`/posts/${id}`)
        .expect(200);

      expect(res.body).toEqual(postShape({ id, title: 'My Post' }));
    });

    it('должен вернуть 404 если пост не существует', async () => {
      await request(app.getHttpServer())
        .get('/posts/507f1f77bcf86cd799439011')
        .expect(404);
    });
  });

  // ─── PUT /posts/:id ─────────────────────────────────────────────────────────

  describe('PUT /posts/:id — обновление поста', () => {
    it('должен вернуть 204 и обновить данные поста', async () => {
      const createRes = await createPostViaApi(app, blogId).expect(201);
      const { id } = createRes.body;

      await request(app.getHttpServer())
        .put(`/posts/${id}`)
        .send({
          title: 'Updated Title',
          shortDescription: 'Updated short',
          content: 'Updated content',
          blogId,
        })
        .expect(204);

      const getRes = await request(app.getHttpServer())
        .get(`/posts/${id}`)
        .expect(200);

      expect(getRes.body).toEqual(
        postShape({
          title: 'Updated Title',
          shortDescription: 'Updated short',
          content: 'Updated content',
        }),
      );
    });

    it('должен обновить blogName если сменился блог', async () => {
      const blog2Res = await createBlogViaApi(app, { name: 'Blog 2' }).expect(
        201,
      );
      const blog2Id = blog2Res.body.id;

      const createRes = await createPostViaApi(app, blogId).expect(201);
      const { id } = createRes.body;

      await request(app.getHttpServer())
        .put(`/posts/${id}`)
        .send({
          title: 'Title',
          shortDescription: 'Short',
          content: 'Content',
          blogId: blog2Id,
        })
        .expect(204);

      const getRes = await request(app.getHttpServer())
        .get(`/posts/${id}`)
        .expect(200);

      expect(getRes.body.blogId).toBe(blog2Id);
      expect(getRes.body.blogName).toBe('Blog 2');
    });

    it('должен вернуть 404 если пост не существует', async () => {
      await request(app.getHttpServer())
        .put('/posts/507f1f77bcf86cd799439011')
        .send({
          title: 'x',
          shortDescription: 'x',
          content: 'x',
          blogId,
        })
        .expect(404);
    });

    it('должен вернуть 404 если новый blogId не существует', async () => {
      const createRes = await createPostViaApi(app, blogId).expect(201);
      const { id } = createRes.body;

      await request(app.getHttpServer())
        .put(`/posts/${id}`)
        .send({
          title: 'x',
          shortDescription: 'x',
          content: 'x',
          blogId: '507f1f77bcf86cd799439011',
        })
        .expect(404);
    });
  });

  // ─── DELETE /posts/:id ──────────────────────────────────────────────────────

  describe('DELETE /posts/:id — удаление поста', () => {
    it('должен вернуть 204 при успешном удалении', async () => {
      const createRes = await createPostViaApi(app, blogId).expect(201);
      const { id } = createRes.body;

      await request(app.getHttpServer()).delete(`/posts/${id}`).expect(204);
    });

    it('пост должен исчезнуть после удаления', async () => {
      const createRes = await createPostViaApi(app, blogId).expect(201);
      const { id } = createRes.body;

      await request(app.getHttpServer()).delete(`/posts/${id}`).expect(204);

      await request(app.getHttpServer()).get(`/posts/${id}`).expect(404);
    });

    it('должен вернуть 404 если пост не существует', async () => {
      await request(app.getHttpServer())
        .delete('/posts/507f1f77bcf86cd799439011')
        .expect(404);
    });

    it('должен вернуть 404 при повторном удалении', async () => {
      const createRes = await createPostViaApi(app, blogId).expect(201);
      const { id } = createRes.body;

      await request(app.getHttpServer()).delete(`/posts/${id}`).expect(204);
      await request(app.getHttpServer()).delete(`/posts/${id}`).expect(404);
    });

    it('не должен влиять на другие посты при удалении', async () => {
      const post1 = await createPostViaApi(app, blogId, {
        title: 'Post 1',
      }).expect(201);
      await createPostViaApi(app, blogId, { title: 'Post 2' }).expect(201);

      await request(app.getHttpServer())
        .delete(`/posts/${post1.body.id}`)
        .expect(204);

      const remaining = await request(app.getHttpServer())
        .get('/posts')
        .expect(200);

      expect(remaining.body.totalCount).toBe(1);
      expect(remaining.body.items[0].title).toBe('Post 2');
    });
  });
});
