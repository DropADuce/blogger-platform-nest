import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Like, LikeModel } from 'modules/blogger-platform/domain/like.entity';
import {
  ExtendedLikesViewDto,
  LikesViewDto,
} from 'modules/blogger-platform/api/view-dto/likes.view-dto';

@Injectable()
export class LikesQueryRepository {
  constructor(@InjectModel(Like.name) private readonly like: LikeModel) {}

  async getLikesInfo(params: {
    entity: 'Post' | 'Comment';
    entityId: string;
    userId?: string;
  }) {
    const [result] = await this.like.aggregate([
      { $match: { entity: params.entity, entityId: params.entityId } },
      {
        $facet: {
          counts: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
          userStatus: params.userId
            ? [{ $match: { userId: params.userId } }, { $limit: 1 }]
            : [{ $match: { $expr: { $eq: [1, 0] } } }],
        },
      },
    ]);

    return {
      likesCount:
        result.counts.find((count) => count._id === 'Like')?.count ?? 0,
      dislikesCount:
        result.counts.find((count) => count._id === 'Dislike')?.count ?? 0,
      myStatus: result.userStatus[0]?.status ?? 'None',
    };
  }

  async getExtendedLikesInfo(params: {
    entity: 'Post' | 'Comment';
    entityId: string;
    userId?: string;
  }) {
    const [result] = await this.like.aggregate([
      { $match: { entity: params.entity, entityId: params.entityId } },
      {
        $facet: {
          counts: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
          userStatus: params.userId
            ? [{ $match: { userId: params.userId } }, { $limit: 1 }]
            : [{ $match: { $expr: { $eq: [1, 0] } } }],
          newestLikes: [
            { $match: { status: 'Like' } },
            { $sort: { createdAt: -1 } },
            { $limit: 3 },
          ],
        },
      },
    ]);

    return {
      likesCount:
        result.counts.find((count) => count._id === 'Like')?.count ?? 0,
      dislikesCount:
        result.counts.find((count) => count._id === 'Dislike')?.count ?? 0,
      myStatus: result.userStatus[0]?.status ?? 'None',
      newestLikes: result.newestLikes.map((reaction) => ({
        addedAt: reaction.createdAt.toISOString(),
        userId: reaction.userId,
        login: reaction.userLogin,
      })),
    };
  }

  async getLikesInfoBatch(params: {
    entity: 'Post' | 'Comment';
    entityIds: Array<string>;
    userId?: string;
  }) {
    const resultMap = new Map<string, LikesViewDto>();

    params.entityIds.forEach((id) => {
      resultMap.set(id, { likesCount: 0, dislikesCount: 0, myStatus: 'None' });
    });

    const [result] = await this.like.aggregate([
      {
        $match: { entity: params.entity, entityId: { $in: params.entityIds } },
      },
      {
        $facet: {
          counts: [
            {
              $group: {
                _id: { entityId: '$entityId', status: '$status' },
                count: { $sum: 1 },
              },
            },
          ],
          userStatus: params.userId
            ? [{ $match: { userId: params.userId } }]
            : [{ $match: { $expr: { $eq: [1, 0] } } }],
        },
      },
    ]);

    result.counts.forEach((resultItem) => {
      const entry = resultMap.get(resultItem._id.entityId)!;

      if (resultItem._id.status === 'Like') entry.likesCount = resultItem.count;
      if (resultItem._id.status === 'Dislike')
        entry.dislikesCount = resultItem.count;
    });

    result.userStatus.forEach((item) => {
      resultMap.get(item.entityId)!.myStatus = item.status;
    });

    return resultMap;
  }

  async getExtendedLikesInfoBatch(params: {
    entity: 'Post' | 'Comment';
    ids: Array<string>;
    userId?: string;
  }) {
    const resultMap = new Map<string, ExtendedLikesViewDto>();

    params.ids.forEach((id) => {
      resultMap.set(id, {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      });
    });

    const [result] = await this.like.aggregate([
      { $match: { entity: params.entity, entityId: { $in: params.ids } } },
      {
        $facet: {
          counts: [
            {
              $group: {
                _id: { entityId: '$entityId', status: '$status' },
                count: { $sum: 1 },
              },
            },
          ],
          userStatus: params.userId
            ? [{ $match: { userId: params.userId } }]
            : [{ $match: { $expr: { $eq: [1, 0] } } }],
          newestLikes: [
            { $match: { status: 'Like' } },
            { $sort: { createdAt: -1 } },
          ],
        },
      },
    ]);

    result.counts.forEach((resultItem) => {
      const entry = resultMap.get(resultItem._id.entityId)!;

      if (resultItem._id.status === 'Like') entry.likesCount = resultItem.count;
      if (resultItem._id.status === 'Dislike')
        entry.dislikesCount = resultItem.count;
    });

    result.userStatus.forEach((item) => {
      resultMap.get(item.entityId)!.myStatus = item.status;
    });

    result.newestLikes.forEach((item) => {
      const entry = resultMap.get(item.entityId)!;

      if (entry.newestLikes.length < 3) {
        entry.newestLikes.push({
          addedAt: item.createdAt.toISOString(),
          userId: item.userId,
          login: item.userLogin,
        });
      }
    });

    return resultMap;
  }
}
