import { HttpStatus, INestApplication } from '@nestjs/common';

import { initSettings } from './helpers/init-settings';
import { deleteAllData } from './helpers/delete-all-data';
import { UsersTestingManager } from './helpers/users-testing-manager';
import { BlogsTestingManager } from './helpers/blogs-testing-manager';
import { PostsTestingManager } from './helpers/posts-testing-manager';

describe('Post likes (e2e)', () => {
  let app: INestApplication;
  let usersManager: UsersTestingManager;
  let blogsManager: BlogsTestingManager;
  let postsManager: PostsTestingManager;
  let blogId: string;
  let postId: string;

  beforeAll(async () => {
    const result = await initSettings();

    app = result.app;

    usersManager = result.userTestManager;
    blogsManager = result.blogsTestingManager;
    postsManager = result.postsTestingManager;
  });

  beforeEach(async () => {
    await deleteAllData(app);

    const blog = await blogsManager.createBlog({
      DTO: {
        name: 'Мой тестовый блог',
        description: 'Описание для моего тестового блога',
        websiteUrl: 'https://testing.com',
      },
    });
    blogId = blog.id;

    const post = await postsManager.createPost({ blogId });
    postId = post.id;
  });

  afterAll(async () => {
    await app.close();
  });

  // ─── PUT /posts/:id/like-status ───────────────────────────────────────────

  describe('PUT /posts/:id/like-status', () => {
    it('должен вернуть 401 без токена', async () => {
      await postsManager.updateLikeStatus({
        postId,
        likeStatus: 'Like',
        accessToken: '',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    });

    it('должен вернуть 404 если пост не существует', async () => {
      const { accessToken } = await usersManager.login({
        DTO: await usersManager
          .createUser({
            DTO: { login: 'user1', email: 'u1@test.com', password: 'pass123' },
          })
          .then((u) => ({
            loginOrEmail: u.login,
            password: 'pass123',
          })),
      });

      await postsManager.updateLikeStatus({
        postId: '507f1f77bcf86cd799439011',
        likeStatus: 'Like',
        accessToken,
        statusCode: HttpStatus.NOT_FOUND,
      });
    });

    it('должен вернуть 400 при невалидном likeStatus', async () => {
      const { accessToken } = await usersManager.login({
        DTO: await usersManager
          .createUser({
            DTO: { login: 'user1', email: 'u1@test.com', password: 'pass123' },
          })
          .then((u) => ({
            loginOrEmail: u.login,
            password: 'pass123',
          })),
      });

      await postsManager.updateLikeStatus({
        postId,
        likeStatus: 'Invalid' as 'Like',
        accessToken,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    });

    it('должен вернуть 204 при корректном запросе', async () => {
      const tokens = await usersManager.createAndLoginManyUsers(1);

      await postsManager.updateLikeStatus({
        postId,
        likeStatus: 'Like',
        accessToken: tokens[0].accessToken,
      });
    });
  });

  // ─── GET /posts/:id — extendedLikesInfo ──────────────────────────────────

  describe('GET /posts/:id — extendedLikesInfo', () => {
    it('неавторизованный пользователь видит myStatus = None', async () => {
      const tokens = await usersManager.createAndLoginManyUsers(1);
      await postsManager.updateLikeStatus({
        postId,
        likeStatus: 'Like',
        accessToken: tokens[0].accessToken,
      });

      const post = await postsManager.getPost({ postId });

      expect(post.extendedLikesInfo.myStatus).toBe('None');
    });

    it('после лайка likesCount = 1 и myStatus = Like', async () => {
      const tokens = await usersManager.createAndLoginManyUsers(1);
      await postsManager.updateLikeStatus({
        postId,
        likeStatus: 'Like',
        accessToken: tokens[0].accessToken,
      });

      const post = await postsManager.getPost({
        postId,
        accessToken: tokens[0].accessToken,
      });

      expect(post.extendedLikesInfo).toEqual({
        likesCount: 1,
        dislikesCount: 0,
        myStatus: 'Like',
        newestLikes: [
          expect.objectContaining({
            userId: expect.any(String),
            login: expect.any(String),
            addedAt: expect.any(String),
          }),
        ],
      });
    });

    it('после дизлайка dislikesCount = 1, newestLikes пуст', async () => {
      const tokens = await usersManager.createAndLoginManyUsers(1);
      await postsManager.updateLikeStatus({
        postId,
        likeStatus: 'Dislike',
        accessToken: tokens[0].accessToken,
      });

      const post = await postsManager.getPost({
        postId,
        accessToken: tokens[0].accessToken,
      });

      expect(post.extendedLikesInfo.dislikesCount).toBe(1);
      expect(post.extendedLikesInfo.myStatus).toBe('Dislike');
      expect(post.extendedLikesInfo.newestLikes).toHaveLength(0);
    });

    it('смена Like → None убирает лайк', async () => {
      const tokens = await usersManager.createAndLoginManyUsers(1);
      await postsManager.updateLikeStatus({
        postId,
        likeStatus: 'Like',
        accessToken: tokens[0].accessToken,
      });
      await postsManager.updateLikeStatus({
        postId,
        likeStatus: 'None',
        accessToken: tokens[0].accessToken,
      });

      const post = await postsManager.getPost({
        postId,
        accessToken: tokens[0].accessToken,
      });

      expect(post.extendedLikesInfo.likesCount).toBe(0);
      expect(post.extendedLikesInfo.myStatus).toBe('None');
      expect(post.extendedLikesInfo.newestLikes).toHaveLength(0);
    });

    it('newestLikes содержит не более 3 последних, отсортированных по убыванию даты', async () => {
      const tokens = await usersManager.createAndLoginManyUsers(4);

      for (const { accessToken } of tokens) {
        await postsManager.updateLikeStatus({
          postId,
          likeStatus: 'Like',
          accessToken,
        });
      }

      const post = await postsManager.getPost({ postId });
      const { newestLikes } = post.extendedLikesInfo;

      expect(newestLikes).toHaveLength(3);
      expect(
        new Date(newestLikes[0].addedAt) >= new Date(newestLikes[1].addedAt),
      ).toBe(true);
    });

    it('каждый пользователь видит свой myStatus независимо', async () => {
      const tokens = await usersManager.createAndLoginManyUsers(2);
      await postsManager.updateLikeStatus({
        postId,
        likeStatus: 'Like',
        accessToken: tokens[0].accessToken,
      });
      await postsManager.updateLikeStatus({
        postId,
        likeStatus: 'Dislike',
        accessToken: tokens[1].accessToken,
      });

      const post1 = await postsManager.getPost({
        postId,
        accessToken: tokens[0].accessToken,
      });
      const post2 = await postsManager.getPost({
        postId,
        accessToken: tokens[1].accessToken,
      });

      expect(post1.extendedLikesInfo.myStatus).toBe('Like');
      expect(post2.extendedLikesInfo.myStatus).toBe('Dislike');
      expect(post1.extendedLikesInfo.likesCount).toBe(1);
      expect(post1.extendedLikesInfo.dislikesCount).toBe(1);
    });
  });

  // ─── GET /posts — список с лайками ───────────────────────────────────────

  describe('GET /posts — extendedLikesInfo в списке', () => {
    it('каждый пост в списке содержит корректную extendedLikesInfo', async () => {
      const tokens = await usersManager.createAndLoginManyUsers(1);
      await postsManager.updateLikeStatus({
        postId,
        likeStatus: 'Like',
        accessToken: tokens[0].accessToken,
      });

      const result = await postsManager.getPosts({
        accessToken: tokens[0].accessToken,
      });

      expect(result.items[0].extendedLikesInfo).toEqual({
        likesCount: 1,
        dislikesCount: 0,
        myStatus: 'Like',
        newestLikes: [expect.objectContaining({ login: expect.any(String) })],
      });
    });

    it('без токена myStatus = None во всех постах', async () => {
      const tokens = await usersManager.createAndLoginManyUsers(1);
      await postsManager.updateLikeStatus({
        postId,
        likeStatus: 'Like',
        accessToken: tokens[0].accessToken,
      });

      const result = await postsManager.getPosts();

      result.items.forEach(
        (post: { extendedLikesInfo: { myStatus: string } }) => {
          expect(post.extendedLikesInfo.myStatus).toBe('None');
        },
      );
    });
  });

  // ─── GET /blogs/:id/posts — посты блога с лайками ────────────────────────

  describe('GET /blogs/:id/posts — extendedLikesInfo в постах блога', () => {
    it('посты блога содержат корректную extendedLikesInfo', async () => {
      const tokens = await usersManager.createAndLoginManyUsers(1);
      await postsManager.updateLikeStatus({
        postId,
        likeStatus: 'Like',
        accessToken: tokens[0].accessToken,
      });

      const result = await postsManager.getPostsByBlog({
        blogId,
        accessToken: tokens[0].accessToken,
      });

      expect(result.items[0].extendedLikesInfo).toEqual({
        likesCount: 1,
        dislikesCount: 0,
        myStatus: 'Like',
        newestLikes: [expect.objectContaining({ login: expect.any(String) })],
      });
    });
  });
});
