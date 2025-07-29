export interface PostInterface {
  id: number,
  title: string,
  content: string,
  username: string,
  email: string,
  team: number,
  team_name: string,
  posted_on: Date,
  authenticated_permission: 0 | 1 | 2,
  team_permission: 0 | 1 | 2,
  public_permission: boolean,
  count_likes: number,
  count_comments: number
}

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
  content: string
}

export interface GenericPaginatedResponse {
  prevPage: string,
  nextPage: string,
  currentPage: number,
  pages: number,
  count: number
}

export interface PostResponse extends GenericPaginatedResponse {
    results: PostInterface[]
}

export interface LikeResponse extends GenericPaginatedResponse {
  results: LikeInterface[]
}

export interface CommentResponse extends GenericPaginatedResponse {
  results: CommentInterface[]
}
