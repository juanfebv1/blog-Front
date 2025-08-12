
export interface PostInterfaceResponse {
  id: number,
  title: string,
  content: string,
  username: string,
  email: string,
  team: number,
  team_name: string,
  posted_on: string,
  authenticated_permission: 0 | 1 | 2,
  team_permission: 0 | 1 | 2,
  public_permission: boolean,
  count_likes: number,
  count_comments: number
}

export interface PostInterface extends PostInterfaceResponse {
  hasLiked?: boolean
}

export interface PostCreateInterface {
  title: string | null,
  content: string | null,
  public_permission: boolean | null,
  authenticated_permission: number | null,
  team_permission: number | null,
}

export interface PostFormInterface {
  title: string;
  content: string;
  publicPermission: boolean;
  authenticatedPermission: number;
  teamPermission: number;
};

export interface LikeInterface {
  id: number,
  post: number,
  user: number,
  username: string,
  email: string
  liked_at: Date,
}

export interface CommentInterface {
  id: number,
  post: number,
  user: number,
  username: string,
  email: string
  content: string,
  commented_at: Date,
}

export interface GenericPaginatedResponse {
  prevPage: string | null,
  nextPage: string | null,
  currentPage: number,
  pages: number,
  count: number
}

export interface PostResponse extends GenericPaginatedResponse {
    results: PostInterfaceResponse[]
}

export interface LikeResponse extends GenericPaginatedResponse {
  results: LikeInterface[]
}

export interface CommentResponse extends GenericPaginatedResponse {
  results: CommentInterface[]
}
