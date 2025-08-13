import { TestBed } from '@angular/core/testing';
import { PostService } from './post-service';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { PostCreateInterface, PostResponse } from '../../models/post.model';
import { mockBasePost, mockBasePostResponse } from '../../mock-data';
import { Token } from '../token';
import { ADD_TOKEN, authInterceptor } from '../../interceptors/auth-interceptor';

describe('PostService', () => {
  let service: PostService;
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
    service = TestBed.inject(PostService);
    httpController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getPosts() when no page indicated', () => {
    const mockResponse: PostResponse = {
      prevPage: null,
      nextPage: null,
      currentPage: 1,
      pages: 1,
      count: 8,
      results: []
    }
    service.getPosts().subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });
    const req = httpController.expectOne(`${apiUrl}/posts/`);
    expect(req.request.method).toBe('GET');
    expect(req.request.body).toBeFalsy();
    expect(req.request.context.get(ADD_TOKEN)).toBeTrue();
    expect(req.request.headers.has('Authorization')).toBeTrue();
    req.flush(mockResponse);
  })

  it('getPosts() when page indicated', () => {
    const pageUrl = 'http://localhost/posts/?page=2';
    const mockResponse: PostResponse = {
      prevPage: 'firstPage',
      nextPage: null,
      currentPage: 2,
      pages: 2,
      count: 15,
      results: []
    };
    service.getPosts(pageUrl).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });
    const req = httpController.expectOne(pageUrl);
    expect(req.request.method).toBe('GET');
    expect(req.request.body).toBeFalsy();
    expect(req.request.context.get(ADD_TOKEN)).toBeTrue();
    expect(req.request.headers.has('Authorization')).toBeTrue();
    req.flush(mockResponse);
  });

  it('getPost()', () => {
    const postId = 1;
    service.getPost(1).subscribe((res) => {
      expect(res).toEqual(mockBasePostResponse)
    })
    const req = httpController.expectOne(`${apiUrl}/posts/${postId}/`)
    expect(req.request.method).toBe('GET');
    expect(req.request.body).toBeFalsy();
    expect(req.request.context.get(ADD_TOKEN)).toBeTrue();
    expect(req.request.headers.has('Authorization')).toBeTrue();
    req.flush(mockBasePostResponse);
  });

  it('createPost()', () => {
    const payload: PostCreateInterface = {
      title: mockBasePost.title,
      content: mockBasePost.content,
      public_permission: mockBasePost.public_permission,
      authenticated_permission: mockBasePost.authenticated_permission,
      team_permission: mockBasePost.team_permission
    };
    service.createPost(payload).subscribe((res) => {
      expect(res).toEqual(mockBasePostResponse);
    });
    const req = httpController.expectOne(`${apiUrl}/posts/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    expect(req.request.context.get(ADD_TOKEN)).toBeTrue();
    expect(req.request.headers.has('Authorization')).toBeTrue();
    req.flush(mockBasePostResponse);
  });

  it('editPost()', () => {
    const payload: PostCreateInterface = {
      title: mockBasePost.title,
      content: mockBasePost.content,
      public_permission: mockBasePost.public_permission,
      authenticated_permission: mockBasePost.authenticated_permission,
      team_permission: mockBasePost.team_permission
    };
    service.editPost(1, payload).subscribe((res) => {
      expect(res).toEqual(mockBasePostResponse);
    });
    const req = httpController.expectOne(`${apiUrl}/posts/1/`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    expect(req.request.context.get(ADD_TOKEN)).toBeTrue();
    expect(req.request.headers.has('Authorization')).toBeTrue();
    req.flush(mockBasePostResponse);
  });

  it('deletePost()', () => {
    const postId = 1;
    service.deletePost(postId).subscribe();

    const req = httpController.expectOne(`${apiUrl}/posts/${postId}/`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.body).toBeFalsy();
    expect(req.request.context.get(ADD_TOKEN)).toBeTrue();
    expect(req.request.headers.has('Authorization')).toBeTrue();
  });

});

describe('PostService when user not logged in', () => {
  let service: PostService;
  let httpController: HttpTestingController;
  const apiUrl = environment.apiUrl;

  const tokenMock = {
    getToken: jasmine.createSpy().and.returnValue(null),
    isValidtoken: jasmine.createSpy().and.returnValue(false),
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
    service = TestBed.inject(PostService);
    httpController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getPosts() when no page indicated', () => {
    const mockResponse: PostResponse = {
      prevPage: null,
      nextPage: null,
      currentPage: 1,
      pages: 1,
      count: 8,
      results: []
    }
    service.getPosts().subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });
    const req = httpController.expectOne(`${apiUrl}/posts/`);
    expect(req.request.method).toBe('GET');
    expect(req.request.body).toBeFalsy();
    expect(req.request.context.get(ADD_TOKEN)).toBeTrue();
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush(mockResponse);
  })

  it('getPosts() when page indicated', () => {
    const pageUrl = 'http://localhost/posts/?page=2';
    const mockResponse: PostResponse = {
      prevPage: 'firstPage',
      nextPage: null,
      currentPage: 2,
      pages: 2,
      count: 15,
      results: []
    };
    service.getPosts(pageUrl).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });
    const req = httpController.expectOne(pageUrl);
    expect(req.request.method).toBe('GET');
    expect(req.request.body).toBeFalsy();
    expect(req.request.context.get(ADD_TOKEN)).toBeTrue();
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush(mockResponse);
  });

  it('getPost()', () => {
    const postId = 1;
    service.getPost(1).subscribe((res) => {
      expect(res).toEqual(mockBasePostResponse)
    })
    const req = httpController.expectOne(`${apiUrl}/posts/${postId}/`)
    expect(req.request.method).toBe('GET');
    expect(req.request.body).toBeFalsy();
    expect(req.request.context.get(ADD_TOKEN)).toBeTrue();
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush(mockBasePostResponse);
  });

  it('createPost()', () => {
    const payload: PostCreateInterface = {
      title: mockBasePost.title,
      content: mockBasePost.content,
      public_permission: mockBasePost.public_permission,
      authenticated_permission: mockBasePost.authenticated_permission,
      team_permission: mockBasePost.team_permission
    };
    service.createPost(payload).subscribe((res) => {
      expect(res).toEqual(mockBasePostResponse);
    });
    const req = httpController.expectOne(`${apiUrl}/posts/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    expect(req.request.context.get(ADD_TOKEN)).toBeTrue();
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush(mockBasePostResponse);
  });

  it('editPost()', () => {
    const payload: PostCreateInterface = {
      title: mockBasePost.title,
      content: mockBasePost.content,
      public_permission: mockBasePost.public_permission,
      authenticated_permission: mockBasePost.authenticated_permission,
      team_permission: mockBasePost.team_permission
    };
    service.editPost(1, payload).subscribe((res) => {
      expect(res).toEqual(mockBasePostResponse);
    });
    const req = httpController.expectOne(`${apiUrl}/posts/1/`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    expect(req.request.context.get(ADD_TOKEN)).toBeTrue();
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush(mockBasePostResponse);
  });

  it('deletePost()', () => {
    const postId = 1;
    service.deletePost(postId).subscribe();

    const req = httpController.expectOne(`${apiUrl}/posts/${postId}/`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.body).toBeFalsy();
    expect(req.request.context.get(ADD_TOKEN)).toBeTrue();
    expect(req.request.headers.has('Authorization')).toBeFalse();
  });

});
