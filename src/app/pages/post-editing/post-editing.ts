import { Component, inject, signal } from '@angular/core';
import { Auth } from '../../services/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { PostService } from '../../services/blog/post-service';
import { Notification } from '../../services/notification';
import { of, switchMap, throwError } from 'rxjs';
import { PostCreateInterface, PostFormInterface, PostInterfaceResponse } from '../../models/post.model';
import { PostForm } from '../../shared/post-form/post-form';
import { CommonModule } from '@angular/common';


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

  postId!: Number;
  status: 'init' | 'loading' | 'ready' = 'init';

  initialValues: PostFormInterface = {
    title: '',
    content: '',
    publicPermission: true,
    authenticatedPermission: 1,
    teamPermission: 2,
  }

  constructor() {
    this.status = 'loading';
    this.route.paramMap.pipe(
      switchMap((params) => {
        const paramId = params.get('id');
        const postId = Number(paramId);
        if (Number.isNaN(postId)) {
          return throwError(() => ({error: "Invalid url"}));
        }
        this.postId = postId;
        return this.postService.getPost(postId);
        }),
      switchMap((post) => {
        if (!this.userCanEdit(post)) {
          return throwError(() => ({error: "Forbidden access to the post"}))
        }
        const initialForm: PostFormInterface = {
          title: post.title,
          content: post.content,
          publicPermission: post.public_permission,
          authenticatedPermission: post.authenticated_permission,
          teamPermission: post.team_permission
        }
        this.initialValues = initialForm;
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

  userCanEdit(post: PostInterfaceResponse) {
    const user = this.authService.currentUserSig();

    if (!this.authService.isLoggedInSig() || !user) return false;

    if(user.role === 'admin') return true;

    if (post.email === user.email) return true;

    if (post.authenticated_permission > 1) return true;

    if (post.team_permission > 1 && Number(post.team) === Number(user.team)) {
      return true;
    }
    return false;
  }

  saveChanges(post: PostCreateInterface) {
    this.postService.editPost(Number(this.postId), post)
    .subscribe({
      next: () => {
        this.notification.displayNotification('Post successfully edited', 2000);
        setTimeout(() => this.router.navigateByUrl(`/posts/${this.postId}`), 1500);
      }
    })
  }


}
