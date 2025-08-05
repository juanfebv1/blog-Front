import { Component, inject, signal } from '@angular/core';
import { Auth } from '../../services/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { PostService } from '../../services/blog/post-service';
import { Notification } from '../../services/notification';
import { catchError, of, switchMap, tap, throwError } from 'rxjs';
import { PostCreateInterface, PostInterface } from '../../models/post.model';
import { PostForm } from '../../shared/post-form/post-form';
import { CommonModule } from '@angular/common';

interface PostFormInterface {
    title: string;
    content: string;
    publicPermission: boolean;
    authenticatedPermission: number;
    teamPermission: number;
  };

@Component({
  selector: 'app-post-editing',
  imports: [PostForm, CommonModule],
  templateUrl: './post-editing.html',
  styleUrl: './post-editing.scss'
})
export class PostEditing {

  private authService = inject(Auth);
  private router = inject(Router);
  private postService = inject(PostService);
  private route = inject(ActivatedRoute);
  private notification = inject(Notification);

  status: 'init' | 'loading' | 'ready' = 'init';

  post!: PostInterface;

  initialValues = signal<PostFormInterface>({
    title: '',
    content: '',
    publicPermission: true,
    authenticatedPermission: 1,
    teamPermission: 2,
  })

  constructor() {
    this.status = 'loading';
    this.route.paramMap.pipe(
      switchMap((params) => {
        const postId = params.get('id');
        if (postId){
          return this.postService.getPost(Number(postId));
        }
        else {
          return throwError(() => ({error: "Invalid url"}))
        }
      }),
      switchMap((post) => {
        this.post = post;
        if (!this.userCanEdit()) {
          return throwError(() => ({error: "Forbidden access to the post"}))
        }
        const initialForm: PostFormInterface = {
          title: post.title,
          content: post.content,
          publicPermission: post.public_permission,
          authenticatedPermission: post.authenticated_permission,
          teamPermission: post.team_permission
        }
        this.initialValues.set(initialForm);
        return of(post);
      })
    )
    .subscribe({
      next: () => {
        this.status = 'ready';
      },
      error: (error) => {
        console.error(error);
        this.notification.displayNotification('Post not found or inaccesible', 3000);
        this.router.navigateByUrl('not-found');
      }
    })
  }

  userCanEdit() {
    const user = this.authService.currentUserSig();

    if (!this.authService.isLoggedInSig() || !user) return false;

    if (this.post?.email === user.email) return true;

    if (this.post.authenticated_permission > 1) return true;

    if (this.post.team_permission > 1 && Number(this.post.team) === Number(user.team)) {
      return true;
    }
    console.log("Didn't evaluate", this.post)
    return false;
  }

  saveChanges(post: PostCreateInterface) {
    this.postService.editPost(this.post.id, post)
    .subscribe({
      next: () => {
        this.notification.displayNotification('Post successfully edited', 2000);
        setTimeout(() => this.router.navigateByUrl(`/posts/${this.post.id}`), 1500);
      }
    })
  }


}
