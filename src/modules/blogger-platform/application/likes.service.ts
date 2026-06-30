import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { LikesRepository } from 'modules/blogger-platform/infrastructure/likes.repository';
import { UpdateLikeDTO } from 'modules/blogger-platform/dto/update-like.dto';
import { Like, LikeModel } from 'modules/blogger-platform/domain/like.entity';
import { UsersExternalRepository } from 'modules/user-accounts/infrastructure/external-query/users.external-repository';

@Injectable()
export class LikesService {
  constructor(
    private readonly usersExternalRepository: UsersExternalRepository,
    private readonly likesRepository: LikesRepository,
    @InjectModel(Like.name) private readonly likeModel: LikeModel,
  ) {}

  async updateLike(likeDTO: UpdateLikeDTO) {
    const user = await this.usersExternalRepository.findByIdOrFail(
      likeDTO.userId,
    );

    const existingLike = await this.likesRepository.findExistingLike({
      entity: likeDTO.entity,
      entityId: likeDTO.entityId,
      userId: likeDTO.userId,
    });

    if (existingLike) {
      existingLike.updateStatus({ status: likeDTO.status });

      return this.likesRepository.save(existingLike);
    }

    const newLike = this.likeModel.createInstance({
      ...likeDTO,
      userLogin: user.login,
    });

    return this.likesRepository.save(newLike);
  }
}
