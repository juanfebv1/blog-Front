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
  private notificationService = inject(Notification);
  private route = inject(ActivatedRoute);

  status: 'init' | 'loading' | 'ready' = 'init';

  postId: number = -1;

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
        if (!this.userCanEditPost()) {
          return throwError(() => ({error: "Invalid permission"}))
        } else {
          return of(post);
        }
      }),
      tap((post) => {
        this.postId = post.id;
        const initialForm: PostFormInterface = {
          title: post.title,
          content: post.content,
          publicPermission: post.public_permission,
          authenticatedPermission: post.authenticated_permission,
          teamPermission: post.team_permission
        }

        this.initialValues.set(initialForm);
      })
    )
    .subscribe({
      next: () => {
        this.status = 'ready';
      },
      error: (error) => {
        this.router.navigateByUrl('not-found');
        console.error(error);
      }
    })
  }

  userCanEditPost() {
    return true;
  }

  saveChanges(post: PostCreateInterface) {
    console.log("Guardando datos: ", post);
  }


}
