import request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { CreateBlogInputDto } from 'modules/blogger-platform/api/input-dto/create-blog.input-dto';
import { BlogViewDto } from 'modules/blogger-platform/api/view-dto/blog.view-dto';
import { UpdateBlogInputDto } from 'modules/blogger-platform/api/input-dto/update-blog.input-dto';
import { CreatePostForBlogInputDto } from 'modules/blogger-platform/api/input-dto/create-post-for-blog.input-dto';

type AuthOption = { user: string; pass: string } | false;

export class BlogsTestingManager {
  constructor(private app: INestApplication) {}

  private withBasicAuth(req: any, auth?: AuthOption): any {
    if (auth === false) return req;
    const user =
      typeof auth === 'object' ? auth.user : process.env.BASIC_USERNAME ?? '';
    const pass =
      typeof auth === 'object' ? auth.pass : process.env.BASIC_PASSWORD ?? '';

    return req.auth(user, pass);
  }

  async createBlog(params: {
    DTO: CreateBlogInputDto;
    status?: HttpStatus;
    auth?: AuthOption;
  }) {
    const response = await this.withBasicAuth(
      request(this.app.getHttpServer()).post('/blogs').send(params.DTO),
      params.auth,
    ).expect(params.status ?? HttpStatus.CREATED);

    return response?.body;
  }

  async createManyBlogs(count: number) {
    const blogsPromises: Array<Promise<BlogViewDto>> = [];

    Array.from({ length: count }).forEach((_: unknown, idx: number) => {
      const response = this.createBlog({
        DTO: {
          name: `Блог ${idx}`,
          description: `Небольшое описание для блога ${idx}`,
          websiteUrl: `https://${idx}.test.com`,
        },
      });

      blogsPromises.push(response);
    });

    return Promise.all(blogsPromises);
  }

  async getAll(
    params: { status?: HttpStatus; query?: Record<string, any> } = {},
  ) {
    const response = await request(this.app.getHttpServer())
      .get('/blogs')
      .query(params.query ?? {})
      .expect(params.status ?? HttpStatus.OK);

    return response?.body;
  }

  async getOne(params: { id: string; status?: HttpStatus }) {
    const response = await request(this.app.getHttpServer())
      .get(`/blogs/${params.id}`)
      .expect(params.status ?? HttpStatus.OK);

    return response?.body;
  }

  async getPostsForBlog(params: {
    id: string;
    status?: HttpStatus;
    query?: Record<string, any>;
  }) {
    const response = await request(this.app.getHttpServer())
      .get(`/blogs/${params.id}/posts`)
      .query(params.query ?? {})
      .expect(params.status ?? HttpStatus.OK);

    return response?.body;
  }

  async updateBlog(params: {
    id: string;
    DTO: UpdateBlogInputDto;
    status?: HttpStatus;
    auth?: AuthOption;
  }) {
    const response = await this.withBasicAuth(
      request(this.app.getHttpServer())
        .put(`/blogs/${params.id}`)
        .send(params.DTO),
      params.auth,
    ).expect(params.status ?? HttpStatus.NO_CONTENT);

    return response?.body;
  }

  async createPostForBlog(params: {
    id: string;
    DTO: CreatePostForBlogInputDto;
    status?: HttpStatus;
    auth?: AuthOption;
  }) {
    const response = await this.withBasicAuth(
      request(this.app.getHttpServer())
        .post(`/blogs/${params.id}/posts`)
        .send(params.DTO),
      params.auth,
    ).expect(params.status ?? HttpStatus.CREATED);

    return response?.body;
  }

  async deleteBlog(params: {
    id: string;
    status?: HttpStatus;
    auth?: AuthOption;
  }) {
    await this.withBasicAuth(
      request(this.app.getHttpServer()).delete(`/blogs/${params.id}`).send(),
      params.auth,
    ).expect(params.status ?? HttpStatus.NO_CONTENT);
  }
}
