import { HttpStatus, INestApplication } from '@nestjs/common';
import { BlogsTestingManager } from './helpers/blogs-testing-manager';
import { initSettings } from './helpers/init-settings';
import { deleteAllData } from './helpers/delete-all-data';

const NONEXISTENT_ID = '000000000000000000000000';

const validBlogDto = {
  name: 'Тест блог',
  description: 'Описание тестового блога',
  websiteUrl: 'https://test.com',
};

const validPostDto = {
  title: 'Заголовок поста',
  shortDescription: 'Короткое описание моего тестового поста',
  content: 'Контент поста',
};

describe('blogs', () => {
  let app: INestApplication;
  let blogsTestingManager: BlogsTestingManager;

  beforeAll(async () => {
    const result = await initSettings();

    app = result.app;
    blogsTestingManager = result.blogsTestingManager;
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /blogs', () => {
    it('Если название блога очень длинное, получим 400 и ошибку', async () => {
      const response = await blogsTestingManager.createBlog({
        DTO: { ...validBlogDto, name: 'a'.repeat(16) },
        status: HttpStatus.BAD_REQUEST,
      });

      expect(response.errorsMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'name',
            message: expect.any(String),
          }),
        ]),
      );
    });

    it('Если описание блога очень длинное, получим 400 и ошибку', async () => {
      const response = await blogsTestingManager.createBlog({
        DTO: { ...validBlogDto, description: 'a'.repeat(501) },
        status: HttpStatus.BAD_REQUEST,
      });

      expect(response.errorsMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'description',
            message: expect.any(String),
          }),
        ]),
      );
    });

    it('Если url некорректен, получим 400 и ошибку', async () => {
      const response = await blogsTestingManager.createBlog({
        DTO: { ...validBlogDto, websiteUrl: 'не корректный url' },
        status: HttpStatus.BAD_REQUEST,
      });

      expect(response.errorsMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'websiteUrl',
            message: expect.any(String),
          }),
        ]),
      );
    });

    it('Без авторизации получим 401', async () => {
      await blogsTestingManager.createBlog({
        DTO: validBlogDto,
        auth: false,
        status: HttpStatus.UNAUTHORIZED,
      });
    });

    it('При корректных данных создаём блог и получаем 201', async () => {
      const blog = await blogsTestingManager.createBlog({ DTO: validBlogDto });

      expect(blog).toMatchObject({
        id: expect.any(String),
        name: validBlogDto.name,
        description: validBlogDto.description,
        websiteUrl: validBlogDto.websiteUrl,
        createdAt: expect.any(String),
        isMembership: expect.any(Boolean),
      });
    });
  });

  describe('GET /blogs', () => {
    it('Без блогов возвращает пустую пагинацию', async () => {
      const result = await blogsTestingManager.getAll();

      expect(result).toMatchObject({
        items: [],
        totalCount: 0,
        pagesCount: 0,
        page: 1,
        pageSize: 10,
      });
    });

    it('Возвращает созданные блоги', async () => {
      await blogsTestingManager.createBlog({ DTO: validBlogDto });
      const result = await blogsTestingManager.getAll();

      expect(result.totalCount).toBe(1);
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toMatchObject({ name: validBlogDto.name });
    });
  });

  describe('GET /blogs/:id', () => {
    it('Несуществующий id — получим 404', async () => {
      await blogsTestingManager.getOne({
        id: NONEXISTENT_ID,
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('Существующий id — возвращает блог', async () => {
      const created = await blogsTestingManager.createBlog({
        DTO: validBlogDto,
      });
      const blog = await blogsTestingManager.getOne({ id: created.id });

      expect(blog).toMatchObject({
        id: created.id,
        name: validBlogDto.name,
        description: validBlogDto.description,
        websiteUrl: validBlogDto.websiteUrl,
      });
    });
  });

  describe('PUT /blogs/:id', () => {
    it('Без авторизации получим 401', async () => {
      const created = await blogsTestingManager.createBlog({
        DTO: validBlogDto,
      });

      await blogsTestingManager.updateBlog({
        id: created.id,
        DTO: { ...validBlogDto, name: 'Новый блог' },
        auth: false,
        status: HttpStatus.UNAUTHORIZED,
      });
    });

    it('Несуществующий id — получим 404', async () => {
      await blogsTestingManager.updateBlog({
        id: NONEXISTENT_ID,
        DTO: validBlogDto,
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('Некорректные данные — получим 400', async () => {
      const created = await blogsTestingManager.createBlog({
        DTO: validBlogDto,
      });
      const response = await blogsTestingManager.updateBlog({
        id: created.id,
        DTO: { ...validBlogDto, name: 'a'.repeat(16) },
        status: HttpStatus.BAD_REQUEST,
      });

      expect(response.errorsMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'name',
            message: expect.any(String),
          }),
        ]),
      );
    });

    it('При корректных данных обновляем блог и получаем 204', async () => {
      const created = await blogsTestingManager.createBlog({
        DTO: validBlogDto,
      });
      const updatedName = 'Новый блог';

      await blogsTestingManager.updateBlog({
        id: created.id,
        DTO: { ...validBlogDto, name: updatedName },
      });

      const blog = await blogsTestingManager.getOne({ id: created.id });
      expect(blog.name).toBe(updatedName);
    });
  });

  describe('DELETE /blogs/:id', () => {
    it('Без авторизации получим 401', async () => {
      const created = await blogsTestingManager.createBlog({
        DTO: validBlogDto,
      });

      await blogsTestingManager.deleteBlog({
        id: created.id,
        auth: false,
        status: HttpStatus.UNAUTHORIZED,
      });
    });

    it('Несуществующий id — получим 404', async () => {
      await blogsTestingManager.deleteBlog({
        id: NONEXISTENT_ID,
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('Удаляем блог — 204, потом GET возвращает 404', async () => {
      const created = await blogsTestingManager.createBlog({
        DTO: validBlogDto,
      });

      await blogsTestingManager.deleteBlog({ id: created.id });
      await blogsTestingManager.getOne({
        id: created.id,
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('POST /blogs/:id/posts', () => {
    it('Без авторизации получим 401', async () => {
      const blog = await blogsTestingManager.createBlog({ DTO: validBlogDto });

      await blogsTestingManager.createPostForBlog({
        id: blog.id,
        DTO: validPostDto,
        auth: false,
        status: HttpStatus.UNAUTHORIZED,
      });
    });

    it('Несуществующий blog — получим 404', async () => {
      await blogsTestingManager.createPostForBlog({
        id: NONEXISTENT_ID,
        DTO: validPostDto,
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('При корректных данных создаём пост и получаем 201', async () => {
      const blog = await blogsTestingManager.createBlog({ DTO: validBlogDto });
      const post = await blogsTestingManager.createPostForBlog({
        id: blog.id,
        DTO: validPostDto,
      });

      expect(post).toMatchObject({
        id: expect.any(String),
        title: validPostDto.title,
        shortDescription: validPostDto.shortDescription,
        content: validPostDto.content,
        blogId: blog.id,
      });
    });
  });

  describe('GET /blogs/:id/posts', () => {
    it('Несуществующий blog — получим 404', async () => {
      await blogsTestingManager.getPostsForBlog({
        id: NONEXISTENT_ID,
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('Блог без постов — возвращает пустую пагинацию', async () => {
      const blog = await blogsTestingManager.createBlog({ DTO: validBlogDto });
      const result = await blogsTestingManager.getPostsForBlog({ id: blog.id });

      expect(result).toMatchObject({
        items: [],
        totalCount: 0,
        pagesCount: 0,
      });
    });

    it('Возвращает посты блога', async () => {
      const blog = await blogsTestingManager.createBlog({ DTO: validBlogDto });

      await blogsTestingManager.createPostForBlog({
        id: blog.id,
        DTO: validPostDto,
      });

      const result = await blogsTestingManager.getPostsForBlog({ id: blog.id });

      expect(result.totalCount).toBe(1);
      expect(result.items[0]).toMatchObject({
        title: validPostDto.title,
        blogId: blog.id,
      });
    });
  });
});
