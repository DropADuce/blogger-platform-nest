import { Injectable } from '@nestjs/common';

import { UsersExternalRepository } from '../../user-accounts/infrastructure/external-query/users.external-repository';
import { PostsExternalRepository } from '../../blogger-platform/infrastructure/external-query/posts.external-repository';
import { BlogsExternalRepository } from '../../blogger-platform/infrastructure/external-query/blogs.external-repository';

@Injectable()
export class TestingService {
  constructor(
    private readonly usersExternalRepository: UsersExternalRepository,
    private readonly postsExternalRepository: PostsExternalRepository,
    private readonly blogsExternalRepository: BlogsExternalRepository,
  ) {}

  async removeAll(): Promise<void> {
    await Promise.all([
      this.usersExternalRepository.removeAll(),
      this.postsExternalRepository.removeAll(),
      this.blogsExternalRepository.removeAll(),
    ]);
  }
}
