type LikeStatus = 'None' | 'Like' | 'Dislike';

export type NewestLike = {
  addedAt: string;
  userId: string;
  login: string;
};

export class LikesViewDto {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
}

export class ExtendedLikesViewDto extends LikesViewDto {
  newestLikes: Array<NewestLike>;
}
