import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { CreateUserDTO, UserCreatedDTO } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  register(dataUser: CreateUserDTO) {
    return this.http.post<UserCreatedDTO>(`${this.apiUrl}/register/`, dataUser);
  }
}
