export class UpdateLikeDTO {
  entity: 'Post' | 'Comment';
  status: 'Like' | 'Dislike' | 'None';
  entityId: string;
  userId: string;
}
