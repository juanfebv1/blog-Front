import { TestBed } from '@angular/core/testing';

import { CommentService } from './comment-service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ADD_TOKEN, authInterceptor } from '../../interceptors/auth-interceptor';
import { Token } from '../token';
import { CommentResponse } from '../../models/post.model';

describe('CommentService', () => {
  let service: CommentService;
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
    service = TestBed.inject(CommentService);
    httpController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getComments when no page is indicated', () => {
    const mockResponse: CommentResponse = {
      prevPage: null,
      nextPage: null,
      currentPage: 1,
      pages: 1,
      count: 8,
      results: []
    };
    const postId = 1;
    service.getComments(postId).subscribe();

    const req = httpController.expectOne(req =>
      req.url === `${apiUrl}/comments/` &&
      req.params.get('post') === String(postId)
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.body).toBeFalsy();
    expect(req.request.context.get(ADD_TOKEN)).toBeTrue();
    expect(req.request.headers.has('Authorization')).toBeTrue();
    req.flush(mockResponse);
  });

  it('getComments() when page indicated', () => {
    const page = 2;
    const mockResponse: CommentResponse = {
      prevPage: 'firstPage',
      nextPage: null,
      currentPage: 2,
      pages: 2,
      count: 15,
      results: []
    };
    const postId = 1;
    service.getComments(postId, page).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });
    const req = httpController.expectOne(req =>
      req.url.includes(apiUrl)  &&
      req.params.get('post') === String(postId) &&
      req.params.get('page') === String(page)
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.body).toBeFalsy();
    expect(req.request.context.get(ADD_TOKEN)).toBeTrue();
    expect(req.request.headers.has('Authorization')).toBeTrue();
    req.flush(mockResponse);
  });

  it('commentPost()', () => {
    const postId = 1;
    const content = 'Lorem';
    const payload = {
      post: postId,
      content: 'Lorem'
    };
    service.commentPost(postId, content).subscribe();

    const req = httpController.expectOne(`${apiUrl}/comments/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    expect(req.request.context.get(ADD_TOKEN)).toBeTrue();
    expect(req.request.headers.has('Authorization')).toBeTrue();

  })
});
