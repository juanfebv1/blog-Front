import { LikeInterface, LikeResponse } from './../../models/post.model';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable, of, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'  
})
export class LikeService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  getLikes(postId: number, page: string | null = null) {
    const url = page ? page : `${this.apiUrl}/likes/`;
    const params = new HttpParams().set('post', postId);
    return this.http.get<LikeResponse>(url, {params});
  }

  likePost(postId: number) {
    return this.http.post<LikeInterface>(`${this.apiUrl}/likes/`, {post: postId})
  }

  deleteLike(likeId: number) {
    return this.http.delete<LikeInterface>(`${this.apiUrl}/likes/${likeId}/`)
  }

  unlikePost(userId: number, postId: number): Observable<LikeInterface | null> {
    return this.hasUserLikedPost(userId, postId).pipe(
      switchMap(response => {
        const results = response.results;
        if (results.length > 0) {
          const likeId = results[0].id;
          return this.deleteLike(likeId)
        }
        else {
          return of(null);
        }
      })
    );
  }

  hasUserLikedPost(userId: number, postId: number) {
    let params = new HttpParams().set('user', userId);
    params = params.set('post', postId);
    return this.http.get<LikeResponse>(`${this.apiUrl}/likes/`, {params});
  }
}
