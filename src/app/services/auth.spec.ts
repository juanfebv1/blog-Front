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
import { Notification } from './notification';
import { Token } from './token';

fdescribe('Auth', () => {
  let service: Auth;
  let tokenSpy: jasmine.SpyObj<Token>;
  let httpController: HttpTestingController;

  beforeEach(() => {
    tokenSpy = jasmine.createSpyObj<Token>('Token', [
      'saveToken',
      'saveRefreshToken',
      'removeToken',
      'removeRefreshToken',
      'isValidtoken',
      'isValidRefreshToken',
      'getRefreshToken',
      'getToken'
    ]);

    TestBed.configureTestingModule({
      providers: [
        Auth,
        provideHttpClient(),
        provideHttpClientTesting(),
        {provide: Token, useValue: tokenSpy}
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
      id: 1,
      email: "mock@email.com",
      username: "mockUser",
      team: 1,
      team_name: 'default'
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
  });

  it('login should send POST request and return AuthInterface', () => {
    const mockForm = {
      email: "mock@email.com",
      password: "123456"
    };

    const mockResponse = {
      access: "header.payload.signature",
      refresh: "header.payload.signature",
      user: {
        id: 1,
        email: "mock@email.com",
        username: "mock",
        team: 1,
        team_name: "default team"
      }
    };

    // spy on saveUser
    spyOn(service, 'saveUser');

    service.login(mockForm)
      .subscribe((response) => {
        expect(response).toBe(mockResponse);
        expect(service.saveUser).toHaveBeenCalledOnceWith(mockResponse.user);
        expect(service.currentUserSig()).toEqual(mockResponse.user);
        expect(service.isLoggedInSig()).toBeTrue();
      });

    const request = httpController.expectOne({
      method: 'POST',
      url: environment.apiUrl + '/login/'
    });

    expect(request.request.body).toEqual(mockForm);
    expect(request.request.context.get(ADD_TOKEN)).toBe(false);
    expect(request.request.headers.has('Authorization')).toBeFalse();

    request.flush(mockResponse);

    // verify token calls after flush
    expect(tokenSpy.saveToken).toHaveBeenCalledOnceWith(mockResponse.access);
    expect(tokenSpy.saveRefreshToken).toHaveBeenCalledOnceWith(mockResponse.refresh);
  });

  it('should store user after login', () => {
    const user = {
      id: 1,
      email: 'test@email.com',
      username: 'testuser',
      team: 1,
      team_name: 'default'
    };
    const setItemSpy = spyOn(localStorage, 'setItem');
    service.saveUser(user);
    expect(setItemSpy).toHaveBeenCalledOnceWith('user', JSON.stringify(user));
  });

  it('should load user when valid access token', () => {
    const user = {
      id: 1,
      email: 'test@email.com',
      username: 'testuser',
      team: 1,
      team_name: 'default'
    };
    const userJSON = JSON.stringify(user);
    tokenSpy.isValidtoken.and.returnValue(true);
    spyOn(localStorage, 'getItem').withArgs('user').and.returnValue(userJSON);

    service.loadUser();
    expect(service.currentUserSig()).toEqual(user);
    expect(service.isLoggedInSig()).toBeTrue();
  });

  it('should load user when invalid access token but valid refresh', () => {
    const mockRefreshToken = 'header.payload.signature'
    tokenSpy.isValidtoken.and.returnValue(false);
    tokenSpy.getRefreshToken.and.returnValue(mockRefreshToken);
    tokenSpy.isValidRefreshToken.and.returnValue(true);

    const user = {
      id: 1,
      email: 'test@email.com',
      username: 'testuser',
      team: 1,
      team_name: 'default'
    };
    const userJSON = JSON.stringify(user);
    spyOn(localStorage,'getItem').withArgs('user').and.returnValue(userJSON);

    service.loadUser();

    const request = httpController.expectOne({
      method: 'POST',
      url: environment.apiUrl + '/token/refresh/'
    });

    expect(request.request.body).toEqual({refresh: mockRefreshToken});
    expect(request.request.context.get(ADD_TOKEN)).toBeFalse();
    expect(request.request.headers.has('Authorization')).toBeFalse();
    const newAccesstoken = 'header.payload.signature';
    request.flush({access: newAccesstoken});
    expect(tokenSpy.saveToken).toHaveBeenCalledOnceWith(newAccesstoken);


    expect(service.currentUserSig()).toEqual(user);
    expect(service.isLoggedInSig()).toBeTrue();
  });

  afterEach(() => {
    httpController.verify();
  });
});
