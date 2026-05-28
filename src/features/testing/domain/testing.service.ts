import { Injectable } from '@nestjs/common';

import { UsersRepository } from '../../users/repositories/users.repository';
import { BlogsRepository } from '../../blogs/repositories/blogs.repository';
import { PostsRepository } from '../../posts/repositorits/posts.repository';

@Injectable()
export class TestingService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
  ) {}

  async removeAll() {
    await Promise.all([
      this.usersRepository.removeAll(),
      this.blogsRepository.removeAll(),
      this.postsRepository.removeAll(),
    ]);
  }
}
