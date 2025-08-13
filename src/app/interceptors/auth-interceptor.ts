import {
  HttpClient,
  HttpContext,
  HttpContextToken,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, switchMap, tap } from 'rxjs';
import { Token } from '../services/token';

export const ADD_TOKEN = new HttpContextToken<boolean>(() => true);

export function dontAddToken() {
  return new HttpContext().set(ADD_TOKEN, false);
}

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.context.get(ADD_TOKEN)) {
    return next(request);
  }
  const tokenService = inject(Token);
  const http = inject(HttpClient);
  const token = tokenService.getToken();
  if (!token) {
    return next(request);
  }

  const isValidToken = tokenService.isValidtoken();
  if (!isValidToken) {
    return updateAccessAndRefreshToken(request, next, tokenService, http);
  }
  return addToken(request, next, tokenService);
};

function addToken(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  tokenService: Token
) {
  const accessToken = tokenService.getToken();
  if (!accessToken)
    return next(request);

  const authRequest = request.clone({
    headers: request.headers.set('Authorization', `Bearer ${accessToken}`)
  });
  return next(authRequest);
}

function updateAccessAndRefreshToken(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  tokenService: Token,
  http: HttpClient
) {
  const refreshToken = tokenService.getRefreshToken();

  if (!refreshToken || !tokenService.isValidRefreshToken()) return next(request);

  return http
    .post<{ access: string }>(
      `${environment.apiUrl}/token/refresh/`,
      { refresh: refreshToken },
      { context: dontAddToken() }
    )
    .pipe(
      tap((response) => {
        tokenService.saveToken(response.access);
      }),
      switchMap(() => {
        return addToken(request, next, tokenService);
      }),
      catchError((error) => {
        console.warn('Refresh token failed', error);
        localStorage.removeItem('user');
        tokenService.removeToken();
        tokenService.removeRefreshToken();
        return next(request);
      })
    );
}

