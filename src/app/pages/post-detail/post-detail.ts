import { PostService } from './../../services/blog/post-service';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { concatMap, of, switchMap, tap, toArray } from 'rxjs';
import { CommentInterface, PostInterface } from '../../models/post.model';
import { DatePipe } from '@angular/common';
import { Auth } from '../../services/auth';
import { CommentService } from '../../services/blog/comment-service';
import { FormsModule } from '@angular/forms';

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

  status : 'init' | 'loading' | 'ready' = 'init';

  postId: number = -1;
  post: PostInterface | null = null;

  comments: CommentInterface[] | null = [];
  prevPageComments: string | null = null;
  nextPageComments: string | null = null;
  currentPageComments: number = 0;
  commentCount = 0;

  newComment: string = '';

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
      switchMap((post) => {
        if (!post) return of(null);
        this.post = post
        return this.commentService.getComments(this.postId);
      })
    )
    .subscribe({
      next: (response) => {
        if (!response) {
          this.router.navigateByUrl('not-found');
        } else {
        this.comments = response.results;
        this.status = 'ready';
        }
      },
      error: (error) => {
        console.error(error);
        this.router.navigateByUrl('not-found');
      }
    })
  }

  submitComment() {
    this.commentService.commentPost(this.postId,this.newComment)
    .subscribe((comment) => this.comments?.concat(comment))
  }

}
