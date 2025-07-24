import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { CreateUserDTO, LoginUserDTO, UserProfile } from '../models/user.model';
import { Token } from './token';
import { catchError, EMPTY, of, tap } from 'rxjs';
import { AuthInterface } from '../models/auth.model';
import { dontAddToken } from '../interceptors/auth-interceptor';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private tokenService = inject(Token);
  private apiUrl = environment.apiUrl;

  currentUserSig = signal<UserProfile | undefined | null>(undefined);
  isLoggedInSig = signal<boolean>(false);

  constructor(private http: HttpClient) {
    this.loadUser();
  }

  register(dataUser: CreateUserDTO) {
    return this.http.post<UserProfile>(`${this.apiUrl}/register/`, dataUser, {context: dontAddToken()});
  }

  login(dataUser: LoginUserDTO) {
    return this.http.post<AuthInterface>(`${this.apiUrl}/login/`, dataUser, {context: dontAddToken()})
    .pipe(
      tap((rta) => {
        console.log(rta);
        this.tokenService.saveToken(rta.access);
        this.tokenService.saveRefreshToken(rta.refresh);
        const user = rta.user;
        this.currentUserSig.set(user);
        this.isLoggedInSig.set(true);
        this.saveUser(user);
      })
    )
  }

  logout() {
    this.currentUserSig.set(null);
    this.isLoggedInSig.set(false);
    this.tokenService.removeToken();
    this.tokenService.removeRefreshToken();
    this.removeUser();
  }

  saveUser(user: UserProfile) {
    localStorage.setItem('user', JSON.stringify(user))
  }

  removeUser() {
    localStorage.removeItem('user');
  }

  loadUser() {
    if (!this.tokenService.isValidtoken()) {
      this.refreshToken()
      .subscribe( (response) => {
        if(!response) return;

        const token = response.access;
        this.tokenService.saveToken(token);
        const UserData = localStorage.getItem('user');
        if (!UserData) return;

        const user: UserProfile = JSON.parse(UserData);
        this.currentUserSig.set(user);
        this.isLoggedInSig.set(true);
      })
    }
    else {
      const UserData = localStorage.getItem('user');
      if (!UserData) return;

      const user: UserProfile = JSON.parse(UserData);
      this.currentUserSig.set(user);
      this.isLoggedInSig.set(true);
    }
  }

  refreshToken() {
    const refreshToken = this.tokenService.getRefreshToken();
    if (!refreshToken) return of(null);

    const isValidRefresh = this.tokenService.isValidRefreshToken();
    if (!isValidRefresh) {
      this.logout();
      return of(null);
    }

    return this.http.post<{ access: string }>(`${this.apiUrl}/token/refresh/`, {refresh: refreshToken}, {
      context: dontAddToken()
    })
    .pipe(
      catchError(error => {
        this.logout();
        return of(null);
      })
    )
  }

}
