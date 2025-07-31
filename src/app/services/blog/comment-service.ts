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

  getComments(postId: number, page: string | null = null) {
    const url = page ? page : `${this.apiUrl}/comments/`;
    const params = new HttpParams().set('post', postId);
    return this.http.get<CommentResponse>(url, {params});
  }

  commentPost(postId: number, content: string) {
    const payload = {
      post: postId,
      content: content
    }
    console.log(payload);
    return this.http.post<CommentInterface>(`${this.apiUrl}/comments/`, payload)
  }


}
