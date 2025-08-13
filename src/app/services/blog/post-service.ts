import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { LikeResponse, PostCreateInterface, PostInterface, PostInterfaceResponse, PostResponse } from '../../models/post.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  getPosts(page: string | null = null) {
    const url = page ? page : `${this.apiUrl}/posts/`;
    return this.http.get<PostResponse>(url);
  }

  getPost(postId: number) {
    return this.http.get<PostInterfaceResponse>(`${this.apiUrl}/posts/${postId}/`);
  }

  createPost(post: PostCreateInterface ) {
    return this.http.post<PostInterfaceResponse>(`${this.apiUrl}/posts/`, post);
  }

  editPost(postId: number, payload: PostCreateInterface) {
    return this.http.put(`${this.apiUrl}/posts/${postId}/`, payload);
  }

  deletePost(postId: number) {
    return this.http.delete(`${this.apiUrl}/posts/${postId}/`);
  }
}
