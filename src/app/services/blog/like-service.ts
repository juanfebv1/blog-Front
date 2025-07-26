import { LikeInterface, LikeResponse } from './../../models/post.model';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LikeService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  getLikes(postId: number) {
    const params = new HttpParams().set('post', postId);
    return this.http.get<LikeResponse>(`${this.apiUrl}/likes/`, {params});
  }

  checkLikeFromUser(postId: number) {
    return this.http.get<{liked: boolean}>(`${this.apiUrl}/posts/${postId}/liked/`);
  }

  likePost(postId: number) {
    return this.http.post<LikeInterface>(`${this.apiUrl}/likes/`, {post: postId})
  }
}
