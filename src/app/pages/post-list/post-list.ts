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
  prevPage = '';
  nextPage = '';

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
    this.prevPage = response.prevPage ? response.prevPage : '';
    this.nextPage = response.nextPage ? response.nextPage : '';
    this.posts.set(response.results);
  }

}
