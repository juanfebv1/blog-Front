import { LikeInterface } from './../../models/post.model';
import { Component, effect, inject, Input, Output } from '@angular/core';
import { PostInterface } from '../../models/post.model';
import { CommonModule, DatePipe } from '@angular/common';
import { Auth } from '../../services/auth';
import { LikeService } from '../../services/blog/like-service';
import { OverlayModule } from '@angular/cdk/overlay'
import { Dialog, DIALOG_DATA, DialogModule, DialogRef } from '@angular/cdk/dialog';
import { PostService } from '../../services/blog/post-service';
import { Router, RouterLink } from '@angular/router';

const LIKE_PAGE_SIZE = 15;

@Component({
  selector: 'app-post',
  imports: [DatePipe, OverlayModule, DialogModule, RouterLink, CommonModule],
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
  prevLikesPage: string | null = '';
  nextLikesPage: string | null = '';
  showLikes = false;
  // currentUserId = this.authService.currentUserSig()?.id;
  showEditButtons = false;

  constructor() {
    effect(() => {
      const dummyAuthSubscriptor = this.authService.currentUserSig()?.id
      this.showEditButtons = this.userCanEdit();
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
      return true;
    }
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
        if(this.post.count_likes + 1 > LIKE_PAGE_SIZE){
          this.getLikes();
        } else {
          this.post.count_likes++;
          this.likes = [...this.likes, response];
        }
        this.post.hasLiked = true;
      }
    })
  }

  onUnlikePost() {
    const user = this.authService.currentUserSig();
    if(user && user.id){
      this.likeService.unlikePost(user.id, this.post.id)
      .subscribe({
        next: () => {
          this.post.hasLiked = false;
          this.likes = this.likes.filter((like) => like.user != user.id);
          this.post.count_likes--;
        },
        error: (error) => console.error(error)
      })
    }
  }

  onShowLikes() {
    if(!this.showLikes) {
      this.getLikes();
      this.showLikes = true;
    } else {
      this.showLikes = false;
    }
  }

  getLikes(page: string | null = null) {
    this.likeService.getLikes(this.post.id, page)
    .subscribe({
      next: (response) => {
        this.likes = response.results;
        this.post.count_likes = response.count;
        this.prevLikesPage = response.prevPage;
        this.nextLikesPage = response.nextPage;
      }
    })
  }

  getPrevLikesPage() {
    this.getLikes(this.prevLikesPage);
  }

  getNextLikesPage() {
    this.getLikes(this.nextLikesPage);
  }


  goToDetail() {
    this.router.navigate([`/posts/${this.post.id}`]);
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
