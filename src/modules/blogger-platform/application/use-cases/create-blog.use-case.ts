import { InjectModel } from '@nestjs/mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CreateBlogDto } from 'modules/blogger-platform/dto/create-blog.dto';
import { Blog, BlogModel } from 'modules/blogger-platform/domain/blog.entity';
import { BlogsRepository } from 'modules/blogger-platform/infrastructure/blogs.repository';

export class CreateBlogCommand {
  constructor(readonly blog: CreateBlogDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(
    @InjectModel(Blog.name) private readonly blogModel: BlogModel,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async execute(command: CreateBlogCommand) {
    const blog = this.blogModel.createInstance(command.blog);

    const result = await this.blogsRepository.save(blog);

    return result.id;
  }
}
