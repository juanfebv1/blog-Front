import { Component, effect, inject } from '@angular/core';
import { PostForm } from "../../shared/post-form/post-form";
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';
import { PostService } from '../../services/blog/post-service';
import { PostCreateInterface } from '../../models/post.model';
import { Notification } from '../../services/notification';

@Component({
  selector: 'app-post-creation',
  imports: [PostForm],
  templateUrl: './post-creation.html',
  styleUrl: './post-creation.scss'
})
export class PostCreation {

  private authService = inject(Auth);
  private router = inject(Router);
  private postService = inject(PostService);
  private notificationService = inject(Notification);

  initialValues = {
    title: '',
    content: '',
    publicPermission: true,
    authenticatedPermission: 1,
    teamPermission: 2,
    authorPermission: 2
  };

  constructor() {
    effect(() => {
      const isAuth = this.authService.isLoggedInSig();
      if (!isAuth) this.router.navigateByUrl('login');
    })
  }

  onSubmitPost(post: PostCreateInterface) {
    console.log("Llamando con: ", post);
    this.postService.createPost(post).subscribe({
      next: () => {
        this.notificationService.displayNotification('Post successfully created', 1500);
        setTimeout(() => this.router.navigateByUrl(''), 1500);
      },
      error: () => {
        this.notificationService.displayNotification('Something went wrong', 3000);
      }
    });
  }
}
