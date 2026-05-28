export type CreatePostDTO = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};

export type UpdatePostDTO = {
  title: string;
  shortDescription: string;
  content: string;
  postId: string;
  blogId: string;
  blogName: string;
};
