import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { LikeResponse, ProductResponse } from '../../models/post.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  getPosts(page: number = 1) {
    let params = new HttpParams();
    params = params.set('page', page);
    return this.http.get<ProductResponse>(`${this.apiUrl}/posts/`, {params});
  }

  getLikes(postId: number, page: number = 1) {
    let params = new HttpParams();
    params = params.set('post', postId);
    params = params.set('page', page);
    return this.http.get<LikeResponse>(`${this.apiUrl}/likes/`, {params});
  }
}
