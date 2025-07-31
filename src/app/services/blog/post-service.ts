import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { LikeResponse, PostInterface, PostResponse } from '../../models/post.model';

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

  deletePost(postId: number) {
    return this.http.delete(`${this.apiUrl}/posts/${postId}/`);
  }

  getPost(postId: number) {
    return this.http.get<PostInterface>(`${this.apiUrl}/posts/${postId}/`);
  }

}
  