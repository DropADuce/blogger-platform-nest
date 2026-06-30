import request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';

export class PostsTestingManager {
  constructor(private app: INestApplication) {}

  async createPost(params: {
    blogId: string;
    title?: string;
    shortDescription?: string;
    content?: string;
    statusCode?: number;
  }) {
    const response = await request(this.app.getHttpServer())
      .post('/posts')
      .send({
        blogId: params.blogId,
        title: params.title ?? 'Test Post',
        shortDescription: params.shortDescription ?? 'Test short description',
        content: params.content ?? 'Test content',
      })
      .expect(params.statusCode ?? HttpStatus.CREATED);

    return response.body;
  }

  async updateLikeStatus(params: {
    postId: string;
    likeStatus: 'Like' | 'Dislike' | 'None';
    accessToken: string;
    statusCode?: number;
  }) {
    return request(this.app.getHttpServer())
      .put(`/posts/${params.postId}/like-status`)
      .auth(params.accessToken, { type: 'bearer' })
      .send({ likeStatus: params.likeStatus })
      .expect(params.statusCode ?? HttpStatus.NO_CONTENT);
  }

  async getPost(params: {
    postId: string;
    accessToken?: string;
    statusCode?: number;
  }) {
    const req = request(this.app.getHttpServer()).get(
      `/posts/${params.postId}`,
    );

    if (params.accessToken) {
      req.auth(params.accessToken, { type: 'bearer' });
    }

    const response = await req.expect(params.statusCode ?? HttpStatus.OK);
    return response.body;
  }

  async getPosts(params: { accessToken?: string; statusCode?: number } = {}) {
    const req = request(this.app.getHttpServer()).get('/posts');

    if (params.accessToken) {
      req.auth(params.accessToken, { type: 'bearer' });
    }

    const response = await req.expect(params.statusCode ?? HttpStatus.OK);
    return response.body;
  }

  async getPostsByBlog(params: {
    blogId: string;
    accessToken?: string;
    statusCode?: number;
  }) {
    const req = request(this.app.getHttpServer()).get(
      `/blogs/${params.blogId}/posts`,
    );

    if (params.accessToken) {
      req.auth(params.accessToken, { type: 'bearer' });
    }

    const response = await req.expect(params.statusCode ?? HttpStatus.OK);
    return response.body;
  }
}
