import { LikeInterface } from './../../models/post.model';
import { Component, effect, inject, Input } from '@angular/core';
import { PostInterface } from '../../models/post.model';
import { PostService } from '../../services/blog/post-service';
import { DatePipe } from '@angular/common';
import { Auth } from '../../services/auth';
import { LikeService } from '../../services/blog/like-service';

@Component({
  selector: 'app-post',
  imports: [DatePipe, ],
  templateUrl: './post.html',
  styleUrl: './post.scss'
})
export class Post {

  private postService = inject(PostService);
  private likeService = inject(LikeService);
  private authService = inject(Auth);

  userLoggedIn = false;
  constructor() {
    effect(() => {
      this.userLoggedIn = this.authService.isLoggedInSig();
      this.likeService.getLikes(this.post.id)
      .subscribe({
        next: (result) => this.likes = result.results
      })
      if (this.userLoggedIn){
        this.likeService.checkLikeFromUser(this.post.id)
        .subscribe({
          next: (response) => {
            this.likeFromCurrentUser = response.liked
          }
        })
      }
    })
  }

  @Input() post!: PostInterface;
  likes: LikeInterface[] = [];
  showLikes = false;

  likeFromCurrentUser = false;

  onLikePost() {
    this.likeService.likePost(this.post.id)
    .subscribe({
      next: (response) => {
        this.likeFromCurrentUser = true
      }
    })
  }


  getLikes(page: number = 1) {
    this.postService.getLikes(this.post.id, page)
    .subscribe({
      next: (response) => {
        this.likes = response.results;
      }
    })
  }

  displayLikes() {
    this.getLikes();
    this.showLikes = true;
  }



}
