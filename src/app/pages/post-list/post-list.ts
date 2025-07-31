import { PostService } from './../../services/blog/post-service';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { LikeResponse, PostInterface, PostInterfaceResponse, PostResponse } from '../../models/post.model';
import { Post } from '../../components/post/post';
import { Auth } from '../../services/auth';
import { LikeService } from '../../services/blog/like-service';
import { catchError, count, map, of, zip } from 'rxjs';
import { Notification } from '../../services/notification';


@Component({
  selector: 'app-post-list',
  imports: [Post],
  templateUrl: './post-list.html',
  styleUrl: './post-list.scss'
})
export class PostList {
  private postService = inject(PostService);
  private likeService = inject(LikeService);
  private authService = inject(Auth);
  private notification = inject(Notification);

  posts = signal<PostInterface[]>([]);
  prevPage: string | null = null;
  nextPage: string | null = null;
  countPosts = signal(0);
  currentPage = signal(0);

  startPost = computed(() => Math.max(0, (this.currentPage() - 1) * 10 + 1));
  endPost = computed(() => Math.min(this.countPosts(), this.currentPage() * 10));


  constructor() {
    effect(() => {
      const dummyAuthSubscriptor = this.authService.isLoggedInSig();
      this.getPostList();
    })
  }

  getPostList() {
    this.postService.getPosts()
    .subscribe({
      next: (response) => this.handlePostResponse(response),
      error: (rta) => this.handleErrorResponse()
    })
  }

  prevPagePosts() {
    this.postService.getPosts(this.prevPage).subscribe({
      next: (response) => {
        if(response.results.length < 10) this.getPostList();
        else this.handlePostResponse(response);
      },
      error: (rta) => this.handleErrorResponse()
    });
  }

  nextPagePosts() {
    this.postService.getPosts(this.nextPage).subscribe({
      next: (response) => this.handlePostResponse(response),
      error: (rta) => this.handleErrorResponse()
    });
  }

  handlePostResponse(response: PostResponse) {
    this.prevPage = response.prevPage;
    this.nextPage = response.nextPage;
    this.countPosts.set(response.count);
    this.currentPage.set(response.currentPage);

    const posts = response.results;
    const user = this.authService.currentUserSig()?.id;
    if (!user) {
      const postWithHasLiked = posts.map(post => ({...post, hasLiked: false}));
      this.posts.set(postWithHasLiked);
      return;
    }

    const postswithHasLikedPromise = posts.map(post =>
      this.likeService.hasUserLikedPost(user, post.id).pipe(
        map(response => this.attachLike(post,response)),
        catchError(() => of({...post, hasLiked: false}))
      )
    );

    zip(...postswithHasLikedPromise).subscribe((postsWithHasLiked: PostInterface[]) => {
      this.posts.set(postsWithHasLiked);
    });
  }

  attachLike(post: PostInterfaceResponse, response: LikeResponse): PostInterface {
    return {...post, hasLiked: response.results.length > 0};
  }

  handleErrorResponse() {
    this.notification.displayNotification('Error fetching the posts', 3000);
  }

}
