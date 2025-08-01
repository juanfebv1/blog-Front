import { PostService } from './../../services/blog/post-service';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, concatMap, of, switchMap, tap, toArray, throwError } from 'rxjs';
import { CommentInterface, PostInterface } from '../../models/post.model';
import { DatePipe } from '@angular/common';
import { Auth } from '../../services/auth';
import { CommentService } from '../../services/blog/comment-service';
import { FormsModule } from '@angular/forms';
import { Nav } from '../../shared/nav/nav';

@Component({
  selector: 'app-post-detail',
  imports: [DatePipe, FormsModule, Nav],
  templateUrl: './post-detail.html',
  styleUrl: './post-detail.scss'
})
export class PostDetail {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  authService = inject(Auth);
  private postService = inject(PostService);
  private commentService = inject(CommentService);

  status : 'init' | 'loading' | 'ready' = 'init';

  postId: number = -1;
  post: PostInterface | null = null;

  comments: CommentInterface[] | null = [];
  prevPageComments: string | null = null;
  nextPageComments: string | null = null;
  currentPageComments = signal(0);
  commentCount = signal(0);

  startComment = computed(() => {
    if(this.commentCount() > 0) {
      return (this.currentPageComments() - 1) * 5 + 1
    } else return 0;
  })
  endComment = computed(() => Math.min(this.commentCount(), this.currentPageComments() * 5));

  userCanComment = false;
  newComment: string = '';

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
          this.postId = Number(postId)
          return this.postService.getPost(this.postId);
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
    return this.commentService.getComments(this.postId, page).pipe(
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
    this.commentService.commentPost(this.postId,this.newComment)
    .subscribe((comment) => {
      if (this.comments && this.comments.length < 5) {
        this.comments.push(comment);
        this.commentCount.set(this.commentCount() + 1);
      } else {
        this.getComments().subscribe()
      }
      this.newComment = '';
    }
  )
  }

}
