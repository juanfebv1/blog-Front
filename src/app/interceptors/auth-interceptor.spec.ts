import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpResponse, HttpClient, provideHttpClient, withInterceptors, HttpContext } from '@angular/common/http';
import { of } from 'rxjs';

import { ADD_TOKEN, authInterceptor, dontAddToken } from './auth-interceptor';
import { Token } from '../services/token';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpController: HttpTestingController;
  let tokenServiceSpy: jasmine.SpyObj<Token>;

  const testUrl = '/test';
  const apiUrl = environment.apiUrl;

  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => authInterceptor(req, next));

  beforeEach(() => {
    tokenServiceSpy = jasmine.createSpyObj('Token', [
      'getToken',
      'isValidtoken',
      'getRefreshToken',
      'isValidRefreshToken',
      'saveToken',
      'removeToken',
      'removeRefreshToken'
    ]);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: Token, useValue: tokenServiceSpy }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should add Auth header when token valid', () => {
    const mockToken = 'abc123'
    tokenServiceSpy.getToken.and.returnValue(mockToken);
    tokenServiceSpy.isValidtoken.and.returnValue(true);

    http.get(testUrl).subscribe();

    const req = httpController.expectOne(testUrl);
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
    req.flush({});
  });

  it('should update access token if invalid and refresh valid', () => {
    tokenServiceSpy.getToken.and.returnValue('expired-token');
    tokenServiceSpy.isValidtoken.and.returnValue(false);
    tokenServiceSpy.getRefreshToken.and.returnValue('valid-refresh');
    tokenServiceSpy.isValidRefreshToken.and.returnValue(true);

    http.get(testUrl).subscribe();

    const reqRefresh = httpController.expectOne(apiUrl + '/token/refresh/');

    const newToken = 'new-access-token'
    tokenServiceSpy.getToken.and.returnValue(newToken);
    tokenServiceSpy.isValidtoken.and.returnValue(true);

    reqRefresh.flush({
      access: 'new-access-token'
    });
    expect(tokenServiceSpy.saveToken).toHaveBeenCalledWith(newToken);

    const req = httpController.expectOne(testUrl);
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${newToken}`);
  });

  it('should not add Auth header if not logged in', () => {
    tokenServiceSpy.getToken.and.returnValue(null);
    tokenServiceSpy.isValidtoken.and.returnValue(false);

    http.get(testUrl).subscribe();

    const req = httpController.expectOne(testUrl);
    expect(req.request.headers.has('Authorization')).toBeFalse();
  });

  it('should not add Auth header if dontAddToken() context is setted as false', () => {
    const mockToken = 'abc123'
    tokenServiceSpy.getToken.and.returnValue(mockToken);
    tokenServiceSpy.isValidtoken.and.returnValue(true);

    http.get(testUrl, {
      context: dontAddToken()
    }).subscribe();

    const req = httpController.expectOne(testUrl);
    expect(req.request.headers.has('Authorization')).toBeFalse();
  })

});
