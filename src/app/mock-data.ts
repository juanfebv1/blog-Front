import { LikeInterface, LikeResponse, PostInterface, PostInterfaceResponse } from "./models/post.model";
import { UserProfile } from "./models/user.model";

export const mockUser: UserProfile = {
    id: 1,
    email: "user@email.com",
    username: "mockUser",
    team: 1,
    team_name: "default"
};

export const postsList: PostInterfaceResponse[] = [
  {
      "id": 1,
      "title": "Another Post by juan sfsfsadfagadgadgadgadgaagaadgadgagddagadgadggadgadagadgagdadggadgdgadgfhfshfhs",
      "content": "LoremThere are many varia",
      "username": "felipe",
      "email": "felipe@email.com",
      "team": 1,
      "team_name": "default_team",
      "posted_on": "2025-07-30T17:19:48.421622Z",
      "authenticated_permission": 1,
      "team_permission": 2,
      "public_permission": true,
      "count_likes": 0,
      "count_comments": 0
  },
  {
      "id": 2,
      "title": "Another Post by juan sfsfsadfagadgadgadgadgaagaadgadgagddgadgadagadgagdadggadgdgadgfhfshfhs",
      "content": "LoremThere are many varia",
      "username": "felipe",
      "email": "felipe@email.com",
      "team": 1,
      "team_name": "default_team",
      "posted_on": "2025-07-30T17:19:45.892568Z",
      "authenticated_permission": 1,
      "team_permission": 2,
      "public_permission": true,
      "count_likes": 0,
      "count_comments": 0
  },
  {
      "id": 3,
      "title": "Another Post by juan sfsfsadfadgaagaadgadgagddgadgadagadgagdadggadgdgadgfhfshfhs",
      "content": "LoremThere are many varia",
      "username": "felipe",
      "email": "felipe@email.com",
      "team": 1,
      "team_name": "default_team",
      "posted_on": "2025-07-30T17:19:42.796720Z",
      "authenticated_permission": 1,
      "team_permission": 2,
      "public_permission": true,
      "count_likes": 0,
      "count_comments": 0
  },
  {
      "id": 4,
      "title": "Another Post by juan sfsfsadfadgaagaadgadgagddgadgadgadgdgadgfhfshfhs",
      "content": "LoremThere are many varia",
      "username": "felipe",
      "email": "felipe@email.com",
      "team": 1,
      "team_name": "default_team",
      "posted_on": "2025-07-30T17:19:40.791636Z",
      "authenticated_permission": 1,
      "team_permission": 2,
      "public_permission": true,
      "count_likes": 0,
      "count_comments": 0
  },
  {
      "id": 5,
      "title": "Another Post by juan sfsfsadfadgaagadgadgadgadgdgadgfhfshfhs",
      "content": "LoremThere are many varia",
      "username": "felipe",
      "email": "felipe@email.com",
      "team": 1,
      "team_name": "default_team",
      "posted_on": "2025-07-30T17:19:38.432869Z",
      "authenticated_permission": 1,
      "team_permission": 2,
      "public_permission": true,
      "count_likes": 0,
      "count_comments": 0
  },
  {
      "id": 6,
      "title": "Another Post by juan sfsfsadfadgaadgadgdgadgfhfshfhs",
      "content": "LoremThere are many varia",
      "username": "felipe",
      "email": "felipe@email.com",
      "team": 1,
      "team_name": "default_team",
      "posted_on": "2025-07-30T17:19:36.131566Z",
      "authenticated_permission": 1,
      "team_permission": 2,
      "public_permission": true,
      "count_likes": 0,
      "count_comments": 0
  },
  {
      "id": 7,
      "title": "Another Post by juan sfsfsadfadgadgfhfshfhs",
      "content": "LoremThere are many varia",
      "username": "felipe",
      "email": "felipe@email.com",
      "team": 1,
      "team_name": "default_team",
      "posted_on": "2025-07-30T17:19:33.837151Z",
      "authenticated_permission": 1,
      "team_permission": 2,
      "public_permission": true,
      "count_likes": 0,
      "count_comments": 0
  },
  {
      "id": 8,
      "title": "Another Post by juan sfsfsfhfshfhs",
      "content": "LoremThere are many varia",
      "username": "felipe",
      "email": "felipe@email.com",
      "team": 1,
      "team_name": "default_team",
      "posted_on": "2025-07-30T17:19:26.050066Z",
      "authenticated_permission": 1,
      "team_permission": 2,
      "public_permission": true,
      "count_likes": 0,
      "count_comments": 0
  },
  {
      "id": 9,
      "title": "Another Post by juan",
      "content": "LoremThere are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.",
      "username": "juan",
      "email": "juan@email.com",
      "team": 1,
      "team_name": "default_team",
      "posted_on": "2025-07-28T22:04:30.468668Z",
      "authenticated_permission": 1,
      "team_permission": 1,
      "public_permission": true,
      "count_likes": 4,
      "count_comments": 0
  },
  {
      "id": 10,
      "title": "Another Post by juan",
      "content": "LoremThere are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.",
      "username": "juan",
      "email": "juan@email.com",
      "team": 1,
      "team_name": "default_team",
      "posted_on": "2025-07-28T22:04:27.626681Z",
      "authenticated_permission": 1,
      "team_permission": 1,
      "public_permission": true,
      "count_likes": 4,
      "count_comments": 0
  }
]

export const likesList: LikeResponse = {
  prevPage: null,
  nextPage: null,
  currentPage: 1,
  pages: 1,
  count: 3,
  results: [
      {
          "id": 211,
          "post": 127,
          "user": 4,
          "username": "juan",
          "email": "juan@email.com",
          "liked_at": new Date("2025-07-31T19:48:30.726102Z")
      },
      {
          "id": 224,
          "post": 127,
          "user": 19,
          "username": "breyner",
          "email": "breyner@email.com",
          "liked_at": new Date("2025-07-31T20:55:53.148527Z")
      },
      {
          "id": 1,
          "post": 1,
          "user": 1,
          "username": "mockUser",
          "email": "mockUser@email.com",
          "liked_at": new Date()
      }
  ]
}

export const LongLikeList: LikeResponse = {
  prevPage: null,
  nextPage: 'nextPage',
  currentPage: 1,
  pages: 1,
  count: 15,
  results: [
    {
        "id": 211,
        "post": 127,
        "user": 4,
        "username": "juan",
        "email": "juan@email.com",
        "liked_at": new Date("2025-07-31T19:48:30.726102Z")
    },
    {
        "id": 224,
        "post": 127,
        "user": 19,
        "username": "breyner",
        "email": "breyner@email.com",
        "liked_at": new Date("2025-07-31T20:55:53.148527Z")
    },
    {
        "id": 1,
        "post": 1,
        "user": 1,
        "username": "mockUser",
        "email": "mockUser@email.com",
        "liked_at": new Date()
    },
        {
        "id": 211,
        "post": 127,
        "user": 4,
        "username": "juan",
        "email": "juan@email.com",
        "liked_at": new Date("2025-07-31T19:48:30.726102Z")
    },
    {
        "id": 224,
        "post": 127,
        "user": 19,
        "username": "breyner",
        "email": "breyner@email.com",
        "liked_at": new Date("2025-07-31T20:55:53.148527Z")
    },
        {
        "id": 211,
        "post": 127,
        "user": 4,
        "username": "juan",
        "email": "juan@email.com",
        "liked_at": new Date("2025-07-31T19:48:30.726102Z")
    },
    {
        "id": 224,
        "post": 127,
        "user": 19,
        "username": "breyner",
        "email": "breyner@email.com",
        "liked_at": new Date("2025-07-31T20:55:53.148527Z")
    },    {
        "id": 211,
        "post": 127,
        "user": 4,
        "username": "juan",
        "email": "juan@email.com",
        "liked_at": new Date("2025-07-31T19:48:30.726102Z")
    },
    {
        "id": 224,
        "post": 127,
        "user": 19,
        "username": "breyner",
        "email": "breyner@email.com",
        "liked_at": new Date("2025-07-31T20:55:53.148527Z")
    },
        {
        "id": 211,
        "post": 127,
        "user": 4,
        "username": "juan",
        "email": "juan@email.com",
        "liked_at": new Date("2025-07-31T19:48:30.726102Z")
    },
    {
        "id": 224,
        "post": 127,
        "user": 19,
        "username": "breyner",
        "email": "breyner@email.com",
        "liked_at": new Date("2025-07-31T20:55:53.148527Z")
    },
        {
        "id": 211,
        "post": 127,
        "user": 4,
        "username": "juan",
        "email": "juan@email.com",
        "liked_at": new Date("2025-07-31T19:48:30.726102Z")
    },
    {
        "id": 224,
        "post": 127,
        "user": 19,
        "username": "breyner",
        "email": "breyner@email.com",
        "liked_at": new Date("2025-07-31T20:55:53.148527Z")
    },
        {
        "id": 211,
        "post": 127,
        "user": 4,
        "username": "juan",
        "email": "juan@email.com",
        "liked_at": new Date("2025-07-31T19:48:30.726102Z")
    },
    {
        "id": 224,
        "post": 127,
        "user": 19,
        "username": "breyner",
        "email": "breyner@email.com",
        "liked_at": new Date("2025-07-31T20:55:53.148527Z")
    },
  ]
}

export const mockBasePost: PostInterface =
{
  id: 1,
  title: 'string',
  content: "string",
  username: "string",
  email: "other@email.com",
  team: 1,
  team_name: "string",
  posted_on: new Date().toISOString(),
  authenticated_permission: 1,
  team_permission: 1,
  public_permission: true,
  count_likes: 8,
  count_comments: 14,
  hasLiked: true
}

export const mockLike: LikeInterface = {
  id: 1,
  post: 1,
  user: 1,
  username: "mockUser",
  email: "mockUser@email.com",
  liked_at: new Date()
}
