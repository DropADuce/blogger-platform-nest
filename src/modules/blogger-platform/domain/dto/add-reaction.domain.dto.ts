export class AddReactionDomainDto {
  entity: 'Post' | 'Comment';
  entityId: string;
  status: 'Like' | 'Dislike' | 'None';
  userId: string;
  userLogin: string;
}
