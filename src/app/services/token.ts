import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { jwtDecode, JwtPayload } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class Token {

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  removeToken() {
  localStorage.removeItem('token');
  }

  saveRefreshToken(refresh: string) {
    localStorage.setItem('refresh', refresh);
  }

  getRefreshToken() {
    return localStorage.getItem('refresh');
  }

  removeRefreshToken() {
    localStorage.removeItem('refresh');
  }

  private isValidTokenHelper(token: string) {

    const decodedToken = jwtDecode<JwtPayload>(token);
    if(decodedToken && decodedToken.exp) {
      const tokenDate = new Date(0);
      tokenDate.setUTCSeconds(decodedToken.exp);
      const today = new Date();
      return tokenDate.getTime() > today.getTime();
    }
    return false;
  }

  isValidtoken() {
    const token = this.getToken();
    if (!token) return false;

    return this.isValidTokenHelper(token);
  }

  isValidRefreshToken() {
    const token = this.getRefreshToken();
    if (!token) return false;

    return this.isValidTokenHelper(token);
  }


}
