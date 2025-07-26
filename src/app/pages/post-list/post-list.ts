import { PostService } from './../../services/blog/post-service';
import { Component, inject, signal } from '@angular/core';
import { PostInterface } from '../../models/post.model';
import { Post } from '../../components/post/post';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-post-list',
  imports: [Post, CommonModule],
  templateUrl: './post-list.html',
  styleUrl: './post-list.scss'
})
export class PostList {
  private postService = inject(PostService);

  posts = signal<PostInterface[]>([]);
  currentPage = 0
  pages = 0;
  countPosts = 0;

  ngOnInit() {
    this.getPostList();
  }

  getPostList() {
    this.postService.getPosts()
    .subscribe({
      next: (response) => {
        this.countPosts = response.count;
        this.currentPage = 1;
        this.pages = response.pages;
        this.posts.set(response.results);
      },
      error: (rta) => {
        console.log(rta)
      }
    })
  }

  prevPagePosts() {
    this.postService.getPosts(this.currentPage - 1).subscribe({
      next: (response) => {
        this.currentPage--;
        this.posts.set(response.results);
      }
    });
  }

  nextPagePosts() {
    this.postService.getPosts(this.currentPage + 1).subscribe({
      next: (response) => {
        this.currentPage++;
        this.posts.set(response.results);
      }
    });
  }


}
