import { LikeInterface } from './../../models/post.model';
import { Component, effect, EventEmitter, inject, Input, Output } from '@angular/core';
import { PostInterface } from '../../models/post.model';
import { DatePipe } from '@angular/common';
import { Auth } from '../../services/auth';
import { LikeService } from '../../services/blog/like-service';
import { OverlayModule } from '@angular/cdk/overlay'
import { Dialog, DIALOG_DATA, DialogModule, DialogRef } from '@angular/cdk/dialog';
import { PostService } from '../../services/blog/post-service';
import { Router } from '@angular/router';
import { of, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-post',
  imports: [DatePipe, OverlayModule, DialogModule],
  templateUrl: './post.html',
  styleUrl: './post.scss'
})
export class Post {

  private likeService = inject(LikeService);
  authService = inject(Auth);
  private deleteDialog = inject(Dialog);
  private postService = inject(PostService);
  private router = inject(Router);

  @Input() post!: PostInterface;

  likes: LikeInterface[] = [];
  likesCount = 0;
  prevLikesPage = '';
  nextLikesPage = '';
  showLikes = false;
  commentCount = 0;
  currentUserId = this.authService.currentUserSig()?.id;
  likeFromCurrentUser: boolean | null = null;
  showEditButtons = false;

  constructor() {
    effect(() => {
      this.currentUserId = this.authService.currentUserSig()?.id
      this.likesCount = this.post.count_likes;
      this.commentCount = this.post.count_comments;
      this.getLikes();
      this.showEditButtons = this.userCanEdit();
      if(this.currentUserId){
        this.likeService.hasUserLikedPost(this.currentUserId, this.post.id)
        .subscribe({
          next: (response) => {
            this.likeFromCurrentUser = response.results.length > 0
          }
        })
      }
    })
  }

  userCanEdit() {
    const user = this.authService.currentUserSig();
    if (!this.authService.isLoggedInSig() || !user) {
      return false;
    }
    if (this.post.email === user.email) return true;

    if (this.post.authenticated_permission > 1) return true;

    if (this.post.team_permission > 1 && Number(this.post.team) === Number(user.team)) {
      console.log("Solved")
      return true;
    }
    console.log("Not solved")
    return false;
  }

  onDelete() {
    const confirmDelete = this.deleteDialog.open(DeletePostDialog, {
      minWidth: '300px',
      data: this.post.id
    });
    confirmDelete.closed.subscribe((result) => {
      if (typeof result === 'number') {
        this.postService.deletePost(result)
        .subscribe(() => {
          window.location.href = '';
        })
      }
    })
  }

  onLikePost() {
    this.likeService.likePost(this.post.id)
    .subscribe({
      next: (response) => {
        this.likeFromCurrentUser = true;
        this.likes = [...this.likes, response];
        this.likesCount ++;
        if (this.likesCount > 10) {
          this.likes.splice(10)
        }
      }
    })
  }

  onUnlikePost() {
    if(this.currentUserId){
      this.likeService.unlikePost(this.currentUserId, this.post.id)
      .subscribe( () => {
        this.likeFromCurrentUser = false;
        this.likes = this.likes.filter((like) => like.user != this.currentUserId);
        this.likesCount --;
      }
    )
    }
  }

  getLikes() {
    this.likeService.getLikes(this.post.id)
    .subscribe({
      next: (response) => {
        this.likes = response.results;
        this.prevLikesPage = response.prevPage;
        this.nextLikesPage = response.nextPage;
      }
    })
  }

  getNextLikesPage() {
    this.likeService.getLikes(this.post.id, this.nextLikesPage)
    .subscribe({
      next: (response) => {
        this.likes = response.results;
        this.prevLikesPage = response.prevPage;
        this.nextLikesPage = response.nextPage;
      }
    })
  }

  getPrevLikesPage() {
    this.likeService.getLikes(this.post.id, this.prevLikesPage)
    .subscribe({
      next: (response) => {
        this.likes = response.results;
        this.prevLikesPage = response.prevPage;
        this.nextLikesPage = response.nextPage;
      }
    })
  }

  goToDetail() {
    this.router.navigateByUrl(`/posts/${this.post.id}`);
  }
}

@Component({
  selector: 'delete-post-dialog',
  template:`
    <div class="delete-dialog">
      <p>Are you sure you want to delete this post?</p>
      <button (click)="confirmDelete.close(data)">Delete</button>
      <button (click)="confirmDelete.close()">Cancel</button>
    </div>
  `,
  styleUrl: './post.scss'
})
export class DeletePostDialog {
  confirmDelete = inject<DialogRef<number>>(DialogRef<number>)
  data = inject(DIALOG_DATA);
}
