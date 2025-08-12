import { LikeInterface } from './../../models/post.model';
import { Component, computed, effect, ElementRef, inject, Input, Renderer2, signal, ViewChild } from '@angular/core';
import { PostInterface } from '../../models/post.model';
import { CommonModule, DatePipe } from '@angular/common';
import { Auth } from '../../services/auth';
import { LikeService } from '../../services/blog/like-service';
import { OverlayModule } from '@angular/cdk/overlay'
import { Dialog, DIALOG_DATA, DialogModule, DialogRef } from '@angular/cdk/dialog';
import { PostService } from '../../services/blog/post-service';
import { Router, RouterLink } from '@angular/router';
import truncate from 'html-truncate';
import { DomSanitizer } from '@angular/platform-browser';
import { filter, switchMap } from 'rxjs';



const LIKE_PAGE_SIZE = 2;

@Component({
  selector: 'app-post',
  imports: [
    DatePipe,
    OverlayModule,
    DialogModule,
    RouterLink,
    CommonModule
  ],
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
  currentLikesPage = signal(0);
  countLikes = signal(0);
  showLikes = false;

  startLikes = computed(() => {
    if (this.countLikes() > 0) {
      return Math.max(0, (this.currentLikesPage() - 1) * LIKE_PAGE_SIZE + 1);
    } else {
      return 0
    }
  })
  endLikes = computed(() => Math.min(this.countLikes(), this.currentLikesPage() * LIKE_PAGE_SIZE));

  constructor(
    private sanitizer: DomSanitizer,
    private elRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    this.countLikes.set(this.post.count_likes);
  }

  ngOnChanges() {
    this.countLikes.set(this.post.count_likes);
  }

  get userCanEdit() {
    const user = this.authService.currentUserSig();
    if (!this.authService.isLoggedInSig() || !user) {
      return false;
    }
    if (this.post.email === user.email) {
      return true;
    }
    if (this.post.authenticated_permission > 1){
      return true;
    }

    if (this.post.team_permission > 1 && Number(this.post.team) === Number(user.team)) {
      return true;
    }
    return false;
  }

  get adjustedContent() {
    const temp = document.createElement('div');
    temp.innerHTML = this.post.content;
    const plainContent = temp.textContent || '';
    if (plainContent.length >= 200){
      const newContent = truncate(this.post.content, 200);
      const showMoreTag = '<button class="show-more">Show More</button>';
      const idx = newContent.lastIndexOf('<');

      if (idx === -1){
        return this.sanitizer.bypassSecurityTrustHtml(newContent + showMoreTag);
      } else {
        return this.sanitizer.bypassSecurityTrustHtml(
          newContent.substring(0, idx) + showMoreTag + newContent.substring(idx)
        );
      }
    }

    return this.sanitizer.bypassSecurityTrustHtml(this.post.content);
  }

  onContentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.className === 'show-more'){
      this.goToDetail();
    }
  }

  onLikePost() {
    this.likeService.likePost(this.post.id)
    .subscribe({
      next: (response) => {
        if(this.countLikes() + 1 > LIKE_PAGE_SIZE){
          this.getLikes();
        } else {
          this.post.count_likes = this.post.count_likes + 1;
          this.countLikes.update((value) => value + 1);
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
          this.post.count_likes = this.post.count_likes - 1;
          this.likes = this.likes.filter((like) => like.user != user.id);
          this.countLikes.update((value) => value - 1);
        },
        error: (error) => console.error(error)
      })
    }
  }

  onShowLikes() {
    if(!this.showLikes) {
      this.getLikes();
      // this.showLikes = true;
    } else {
      this.showLikes = false;
    }
  }

  getLikes(page: string | null = null) {
    this.likeService.getLikes(this.post.id, page)
    .subscribe({
      next: (response) => {
        this.likes = response.results;
        this.countLikes.set(response.count);
        this.currentLikesPage.set(response.currentPage);
        this.post.count_likes = response.count;
        this.prevLikesPage = response.prevPage;
        this.nextLikesPage = response.nextPage;
        this.showLikes = true;
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

  onDelete() {
    this.deleteDialog.open(DeletePostDialog, {
      minWidth: '300px',
      data: this.post.id
    }).closed.pipe(
      filter((result): result is number => typeof result === 'number'),
      switchMap(id => this.postService.deletePost(id)),
      switchMap(() => this.router.navigateByUrl('/dummy', { skipLocationChange: true })),
      switchMap(() => this.router.navigate(['/posts']))
    ).subscribe();
  }
}

@Component({
  selector: 'delete-post-dialog',
  template:`
    <div class="delete-dialog">
      <h2>Are you sure you want to delete this post?</h2>
      <div class="buttons">
        <button class="delete" (click)="confirmDelete.close(data)">Delete</button>
        <button (click)="confirmDelete.close()">Cancel</button>
      </div>
    </div>
  `,
  styleUrl: './post.scss'
})
export class DeletePostDialog {
  confirmDelete = inject<DialogRef<number>>(DialogRef<number>)
  data = inject(DIALOG_DATA);
}
