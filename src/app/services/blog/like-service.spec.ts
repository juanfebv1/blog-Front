import { TestBed } from '@angular/core/testing';

import { LikeService } from './like-service';
import { environment } from '../../../environments/environment';
import { HttpParams, provideHttpClient, withInterceptors } from '@angular/common/http';
import { ADD_TOKEN, authInterceptor } from '../../interceptors/auth-interceptor';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Token } from '../token';
import { LikeResponse } from '../../models/post.model';
import { likesList, mockLike } from '../../mock-data';

describe('LikeService', () => {
  let service: LikeService;
  let httpController: HttpTestingController;
  const apiUrl = environment.apiUrl;

  const tokenMock = {
    getToken: jasmine.createSpy().and.returnValue('valid-access-token'),
    isValidtoken: jasmine.createSpy().and.returnValue(true),
    getRefreshToken: jasmine.createSpy(),
    isValidRefreshToken: jasmine.createSpy(),
    saveToken: jasmine.createSpy(),
    removeToken: jasmine.createSpy(),
    removeRefreshToken: jasmine.createSpy()
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        {provide: Token, useValue: tokenMock}
      ]
    });
    service = TestBed.inject(LikeService);
    httpController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getLikes when no page is indicated', () => {
    const mockResponse: LikeResponse = {
      prevPage: null,
      nextPage: null,
      currentPage: 1,
      pages: 1,
      count: 8,
      results: []
    };
    const postId = 1;
    service.getLikes(postId).subscribe();

    const req = httpController.expectOne(`${apiUrl}/likes/?post=${postId}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.body).toBeFalsy();
    expect(req.request.context.get(ADD_TOKEN)).toBeTrue();
    expect(req.request.headers.has('Authorization')).toBeTrue();
    req.flush(mockResponse);
  });

  it('getLikes() when page indicated', () => {
    const pageUrl = 'http://localhost/likes/?page=2';
    const mockResponse: LikeResponse = {
      prevPage: 'firstPage',
      nextPage: null,
      currentPage: 2,
      pages: 2,
      count: 15,
      results: []
    };
    const postId = 1;
    service.getLikes(postId, pageUrl).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });
    const req = httpController.expectOne(pageUrl+`&post=${postId}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.body).toBeFalsy();
    expect(req.request.context.get(ADD_TOKEN)).toBeTrue();
    expect(req.request.headers.has('Authorization')).toBeTrue();
    req.flush(mockResponse);
  });

  it('likePost()', () => {
    const postId = 1;
    service.likePost(postId).subscribe((res) => {
      expect(res).toEqual(mockLike);
    });

    const req = httpController.expectOne(apiUrl+`/likes/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({post: postId});
    expect(req.request.context.get(ADD_TOKEN)).toBeTrue();
    expect(req.request.headers.has('Authorization')).toBeTrue();
    req.flush(mockLike);
  });

  it('deleteLike()', () => {
    const likeId = 1;
    service.deleteLike(likeId).subscribe();

    const req = httpController.expectOne(apiUrl+`/likes/${likeId}/`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.body).toBeFalsy();
    expect(req.request.context.get(ADD_TOKEN)).toBeTrue();
    expect(req.request.headers.has('Authorization')).toBeTrue();
  });

  it('unlikePost()', () => {
    const userId = 1;
    const postId = 1;
    const likeId = mockLike.id;

    const mockHasLikedResponse: LikeResponse = {
      ...likesList,
      results: [mockLike]
    }
    service.unlikePost(userId, postId).subscribe();

    let params = new HttpParams().set('user', userId);
    params = params.set('post', postId);

    const reqHasLiked = httpController.expectOne(req =>
      req.url === `${apiUrl}/likes/` &&
      req.params.get('user') === String(userId) &&
      req.params.get('post') === String(postId)
    );
    reqHasLiked.flush(mockHasLikedResponse);

    const reqDelete = httpController.expectOne(`${apiUrl}/likes/${likeId}/`);
    expect(reqDelete.request.method).toBe('DELETE');
    reqDelete.flush({});
  });

  it('unlikePost() when like does not exists', () => {
    const userId = 1;
    const postId = 1;
    const likeId = mockLike.id;

    const mockHasLikedResponse: LikeResponse = {
      ...likesList,
      results: []
    }
    service.unlikePost(userId, postId).subscribe({
      next: () => {},
      error: (error) => expect(error).toEqual({error: "Like does not exists"})
    });

    let params = new HttpParams().set('user', userId);
    params = params.set('post', postId);

    const reqHasLiked = httpController.expectOne(req =>
      req.url === `${apiUrl}/likes/` &&
      req.params.get('user') === String(userId) &&
      req.params.get('post') === String(postId)
    );
    reqHasLiked.flush(mockHasLikedResponse);

    const reqDelete = httpController.expectNone(req =>
      req.url.startsWith(`${apiUrl}/likes/`) &&
      req.method === 'DELETE'
    );
  })

  it('hasUserLikedPost()', () => {
    const userId = 1;
    const postId = 1;
    const mockHasLikedResponse: LikeResponse = {
      ...likesList,
      results: [mockLike]
    }

    service.hasUserLikedPost(userId, postId).subscribe();
    const req = httpController.expectOne(req =>
      req.url === `${apiUrl}/likes/` &&
      req.params.get('user') === String(userId) &&
      req.params.get('post') === String(postId)
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockHasLikedResponse);
  });


});
