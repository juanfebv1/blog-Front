import { PostService } from './../../services/blog/post-service';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of, switchMap, tap } from 'rxjs';
import { CommentInterface, PostInterface } from '../../models/post.model';
import { DatePipe } from '@angular/common';
import { Auth } from '../../services/auth';
import { CommentService } from '../../services/blog/comment-service';
import { FormsModule } from '@angular/forms';
import { Notification } from '../../services/notification';

const COMMENT_PAGE_SIZE = 5;

@Component({
  selector: 'app-post-detail',
  imports: [DatePipe, FormsModule],
  templateUrl: './post-detail.html',
  styleUrl: './post-detail.scss'
})
export class PostDetail {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  authService = inject(Auth);
  private postService = inject(PostService);
  private commentService = inject(CommentService);
  private notification = inject(Notification);

  status : 'init' | 'loading' | 'ready' = 'init';

  post!: PostInterface;

  comments: CommentInterface[] | null = [];
  prevPageComments: string | null = null;
  nextPageComments: string | null = null;
  currentPageComments = signal(0);
  commentCount = signal(0);

  startComment = computed(() => {
    if(this.commentCount() > 0) {
      return (this.currentPageComments() - 1) * COMMENT_PAGE_SIZE + 1
    } else return 0;
  })
  endComment = computed(() => Math.min(this.commentCount(), this.currentPageComments() * 5));

  userCanComment = false;
  newComment: string = '';
  isSubmitting = false;

  constructor() {
    effect(() => {
      this.userCanComment = this.authService.isLoggedInSig();
    })
  }

  ngOnInit() {
    this.status = 'loading';
    this.route.paramMap.pipe(
      switchMap((params) => {
        const postId = params.get('id');
        if (postId){
          return this.postService.getPost(Number(postId));
        }
        return of(null);
      }),
      catchError(() => {
        this.router.navigateByUrl('not-found');
        return of(null);
      }),
      switchMap((post) => {
        if (!post) return of(null);
        this.post = post;
        return this.getComments()
      })
    )
    .subscribe({
      next: () => this.status = 'ready',
      error: (error) => {
        console.error(error);
      }
    })
  }

  getComments(page: string | null = null) {
    return this.commentService.getComments(this.post.id, page).pipe(
      tap((response) => {
        this.comments = response.results;
        this.prevPageComments = response.prevPage;
        this.nextPageComments = response.nextPage;
        this.currentPageComments.set(response.currentPage);
        this.commentCount.set(response.count);
      }),
      catchError((error) => {
        console.error(error);
        return of(null);
      })
    )
  }

  onPrevPageComments() {
    this.getComments(this.prevPageComments).subscribe()
  }

  onNextPageComments() {
    this.getComments(this.nextPageComments).subscribe()
  }

  submitComment() {
    this.isSubmitting = true;
    this.commentService.commentPost(this.post.id,this.newComment)
    .subscribe({
      next: (comment) => {
      if (this.comments && this.comments.length < COMMENT_PAGE_SIZE) {
        this.comments.push(comment);
        this.commentCount.update(v => v + 1);
      } else {
        this.getComments().subscribe()
      }
      this.newComment = '';
      this.isSubmitting = false;
    },
    error: (error) => {
      this.notification.displaySomethingWentWrong();
      console.error(error);
    }
    })
  }

}
