import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Nav } from './nav';
import { Auth } from '../../services/auth';
import { mockUser } from '../../mock-data';
import { signal } from '@angular/core';
import { RouterModule } from '@angular/router';

describe('Nav', () => {
  let component: Nav;
  let fixture: ComponentFixture<Nav>;
  let authSpy: jasmine.SpyObj<Auth>;
  let mockUserSig = signal(mockUser)

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj('Auth',
       ['logout'],
       {
        currentUserSig: mockUserSig
       }
      );

    await TestBed.configureTestingModule({ 
      imports: [Nav, RouterModule.forRoot([])],
      providers: [
        {provide: Auth, useValue: authSpy}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Nav);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display user info when logged in', () => {
    expect(component.user).toEqual(mockUser);

    const loginRegisterElement = fixture.nativeElement.querySelector('.login-register');
    expect(loginRegisterElement).toBeFalsy();

    const logoutElement = fixture.nativeElement.querySelector('.logout');
    expect(logoutElement).toBeTruthy();
  });

  it('should call logout', () => {
    component.onLogout();
    expect(authSpy.logout).toHaveBeenCalled();
  })
});
