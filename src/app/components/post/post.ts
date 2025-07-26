import { LikeInterface } from './../../models/post.model';
import { Component, effect, inject, Input } from '@angular/core';
import { PostInterface } from '../../models/post.model';
import { PostService } from '../../services/blog/post-service';
import { DatePipe } from '@angular/common';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-post',
  imports: [DatePipe, ],
  templateUrl: './post.html',
  styleUrl: './post.scss'
})
export class Post {

  private postService = inject(PostService);
  private authService = inject(Auth);

  userLoggedIn = false;
  constructor() {
    effect(() => {
      this.userLoggedIn = this.authService.isLoggedInSig();
    })
  }

  @Input() post!: PostInterface;
  likes: LikeInterface[] = [];
  showLikes = false;

  likeFromCurrentUser = false;

  onLikePost() {

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
