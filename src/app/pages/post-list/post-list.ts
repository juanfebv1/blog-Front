import { PostService } from './../../services/blog/post-service';
import { Component, effect, inject, signal } from '@angular/core';
import { PostInterface, PostResponse } from '../../models/post.model';
import { Post } from '../../components/post/post';
import { Auth } from '../../services/auth';


@Component({
  selector: 'app-post-list',
  imports: [Post],
  templateUrl: './post-list.html',
  styleUrl: './post-list.scss'
})
export class PostList {
  private postService = inject(PostService);
  private authService = inject(Auth);

  posts = signal<PostInterface[]>([]);
  prevCursor: string |  null = null;
  nextCursor: string |  null = null;

  constructor() {
    effect(() => {
      const spyAuth = this.authService.isLoggedInSig();
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
    this.postService.getPosts(this.prevCursor).subscribe({
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
    this.postService.getPosts(this.nextCursor).subscribe({
      next: (response) => this.handlePostResponse(response),
      error: (rta) => {
        console.log("Error getting the posts: ",rta);
      }
    });
  }

  handlePostResponse(response: PostResponse) {
    console.log(response);
    if(response.previous){
      const urlPrev = new URL(response.previous) ;
      this.prevCursor = urlPrev.searchParams.get('cursor');
    }
    else this.prevCursor = null;
    if(response.next){
      const urlNext = new URL(response.next);
      this.nextCursor = urlNext.searchParams.get('cursor');
    }
    else this.nextCursor = null;

    this.posts.set(response.results);
  }

}
