import { PostService } from './../../services/blog/post-service';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of, switchMap } from 'rxjs';
import { PostInterface } from '../../models/post.model';

@Component({
  selector: 'app-post-detail',
  imports: [],
  templateUrl: './post-detail.html',
  styleUrl: './post-detail.scss'
})
export class PostDetail {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private postService = inject(PostService);

  postId: string | null = null;
  post: PostInterface | null = null;

  ngOnInit(): void {
    this.route.paramMap
    .pipe(
      switchMap((params) => {
        this.postId = params.get('id');
        if(this.postId){
          return this.postService.getPost(Number(this.postId))
        }
        return of(null);
      })
    )
    .subscribe(data => this.post = data)
  }
}
