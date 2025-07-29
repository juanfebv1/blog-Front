import { PostService } from './../../services/blog/post-service';
import { Component, effect, inject, signal } from '@angular/core';
import { PostInterface, PostInterfaceResponse, PostResponse } from '../../models/post.model';
import { Post } from '../../components/post/post';
import { Auth } from '../../services/auth';
import { LikeService } from '../../services/blog/like-service';
import { catchError, map, of, zip } from 'rxjs';


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

  posts = signal<PostInterface[]>([]);
  prevPage = '';
  nextPage = '';
  countPosts = 0;
  currentPage = 0;


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
      error: (rta) => {
        console.log("Error getting the posts: ", rta)
      }
    })
  }



  prevPagePosts() {
    this.postService.getPosts(this.prevPage).subscribe({
      next: (response) => {
        if(response.results.length < 10) this.getPostList();
        else this.handlePostResponse(response);
      },
      error: (rta) => {
        console.log("Error getting the posts: ", rta);
      }
    });
  }

  nextPagePosts() {
    this.postService.getPosts(this.nextPage).subscribe({
      next: (response) => this.handlePostResponse(response),
      error: (rta) => {
        console.log("Error getting the posts: ",rta);
      }
    });
  }

  handlePostResponse(response: PostResponse) {
    this.prevPage = response.prevPage ?? '';
    this.nextPage = response.nextPage ?? '';
    this.countPosts = response.count;
    this.currentPage = response.currentPage

    const posts = response.results;
    const user = this.authService.currentUserSig()?.id;
    if (!user) {
      const postWithHasLiked = posts.map(post => ({...post, hasLiked: false}));
      this.posts.set(postWithHasLiked);
      return;
    }

    const postswithHasLikedPromise = posts.map(post =>
      this.likeService.hasUserLikedPost(user, post.id).pipe(
        map(response => ({
          ...post,
          hasLiked: response.results.length > 0
        })),
        catchError(() => of({...post, hasLiked: false}))
      )
    );

    zip(...postswithHasLikedPromise).subscribe((postsWithHasLiked: PostInterface[]) => {
      this.posts.set(postsWithHasLiked);
    });

  }

  min(x:number, y:number) {
    return Math.min(x,y)
  }
}
