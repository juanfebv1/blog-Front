import { TestBed } from '@angular/core/testing';
import { Auth } from './auth';
import {
  provideHttpClientTesting,
  HttpTestingController
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CreateUserDTO, UserProfile } from '../models/user.model';
import { environment } from '../../environments/environment';
import { ADD_TOKEN } from '../interceptors/auth-interceptor';

describe('Auth', () => {
  let service: Auth;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        Auth,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(Auth);
    httpController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('register should send POST request and return UserCreatedDTO', () => {
    const mockForm: CreateUserDTO = {
      email: "mock@email.com",
      username: "mockUser",
      password: "123456"
    };
    const mockResponse: UserProfile = {
      email: "mock@email.com",
      username: "mockUser",
    }
    service.register(mockForm)
    .subscribe( (response) => {
      expect(response).toEqual(mockResponse)
    })
    const req = httpController.expectOne({
      method: 'POST',
      url: environment.apiUrl + '/register/'
    })
    expect(req.request.body).toEqual(mockForm);
    expect(req.request.context.get(ADD_TOKEN)).toBe(false);
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush(mockResponse);
  })

  afterEach(() => {
    httpController.verify();
  });
});
