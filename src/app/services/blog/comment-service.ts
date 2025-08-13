import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommentInterface, CommentResponse } from '../../models/post.model';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  getComments(postId: number, page?: number) {
    let params = new HttpParams();
    params = params.set('post', postId);
    if (page) {
      params = params.set('page', page);
    }
    return this.http.get<CommentResponse>(`${this.apiUrl}/comments/`, {params});
  }

  commentPost(postId: number, content: string) {
    const payload = {
      post: postId,
      content: content
    }
    return this.http.post<CommentInterface>(`${this.apiUrl}/comments/`, payload)
  }
}
