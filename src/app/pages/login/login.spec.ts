import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';

import { Login } from './login';
import { Component, signal } from '@angular/core';
import { Auth } from '../../services/auth';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Register } from '../register/register';
import { By } from '@angular/platform-browser';
import { AuthInterface } from '../../models/auth.model';
import { of, throwError } from 'rxjs';
import { Notification } from '../../services/notification';
import { LoginUserDTO } from '../../models/user.model';

@Component({template: ''})
class DummyRegisterComponent {}

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authSpy: jasmine.SpyObj<Auth>;
  let mockIsLoggedInSig = signal(false);

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj('Auth',
      ['login'],
      {
        isLoggedInSig: mockIsLoggedInSig
      }
    )
    await TestBed.configureTestingModule({
      imports: [
        Login,
        ReactiveFormsModule,
        RouterModule.forRoot([
          {path: 'register', component: DummyRegisterComponent}
        ])
      ],
      providers: [
        {provide: Auth, useValue: authSpy}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const grp = () => component.loginForm;
  const formValues = {
    email: "correctEmail@email.com",
    password: "123456"
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to home if user already logged in', fakeAsync(() => {
    mockIsLoggedInSig.set(true);
    const routerSpy = spyOn(TestBed.inject(Router), 'navigateByUrl');

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(routerSpy).toHaveBeenCalledWith('');
    })
  );

  it('login submit button should be disabled when submitting', () => {
    component.isSubmitting = true;
    fixture.detectChanges();
    const submitButton = fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement;
    expect(submitButton.disabled).toBeTrue();
  }
  );

  describe('login form validation' ,() => {
    it('form starts empty', () => {
      const form = grp();
      expect(form.get('email')?.value).toBe('');
      expect(form.get('password')?.value).toBe('')
    });

    it('email should be required', () => {
      grp().setValue(formValues);
      grp().patchValue({email: ''});
      expect(grp().get('email')?.valid).toBeFalse();
      expect(grp().valid).toBeFalse();
      component.login();
      expect(component.emailError).toBe('Email required')
    });

    it('email should have correct format', () => {
      grp().setValue(formValues);
      grp().patchValue({email: 'badEmail'});
      expect(grp().get('email')?.valid).toBeFalse();
      expect(grp().valid).toBeFalse();
      component.login();
      expect(component.emailError).toBe('Invalid email')
    });

    it('password should be required', () => {
      grp().setValue(formValues);
      grp().patchValue({password: ''});
      expect(grp().get('password')?.valid).toBeFalse();
      expect(grp().valid).toBeFalse();
      component.login();
      expect(component.passwordError).toBe('Password required')
    });
  });

  describe('submit behavior', () => {
    it('should login successfully on valid form', fakeAsync(() => {
      const form = grp();
      form.setValue(formValues);
      expect(form.valid).toBeTrue();

      const mockResponse: AuthInterface = {
          access: 'correct.access.token',
          refresh: 'correct.refresh.token',
          user: {
              id: 1,
              email: formValues.email,
              username: 'mockUser',
              team: 1,
              team_name: 'some_team'
          }
      };
      authSpy.login.and.returnValue(of(mockResponse));
      const routerSpy = spyOn(TestBed.inject(Router), 'navigateByUrl');

      component.login();
      expect(component.emailError).toBe('');
      expect(component.passwordError).toBe('');

      const expectedRequestData: LoginUserDTO = {
        email: formValues.email,
        password: formValues.password
      }
      expect(authSpy.login).toHaveBeenCalledOnceWith(expectedRequestData);
      expect(routerSpy).toHaveBeenCalledWith('')
    }));

    it('should display correct error on invalid credentials', () => {
      component.loginForm.setValue(formValues);
      const errorResponse = {
          "detail": "No active account found with the given credentials"
      };
      authSpy.login.and.returnValue(
        throwError(() => ({
          error: errorResponse
        }))
      );
      component.login();
      expect(component.invalidCredentialsError).toBe('Invalid credentials');
      expect(component.emailError).toBe('');
      expect(component.passwordError).toBe('');
      expect(component.isSubmitting).toBe(false);
    });

    it('should display generic error bar when backend responds unknown error', () => {
      component.loginForm.setValue(formValues);
      const errorResponse = {
        "unknown_error": [
            "unknown error details"
        ]
      }
      authSpy.login.and.returnValue(
        throwError( () => ({
        error: errorResponse
        }))
      );
      const notificationSpy = spyOn(TestBed.inject(Notification), 'displaySomethingWentWrong')

      component.login();
      expect(component.emailError).toBe('');
      expect(component.passwordError).toBe('');
      expect(notificationSpy).toHaveBeenCalled();
    });
  })

  describe('resetTouchAfterSubmit()', () => {
    it('should reset email error when value changes', () => {
      const emailControl = component.loginForm.get('email');
      component.emailError = 'Invalid email';
      emailControl?.setValue('sometyping');
      expect(component.emailError).toBe('');
    });

    it('should reset password error message when value changes', () => {
      const passwordControl = component.loginForm.get('password');
      component.passwordError = 'Password is required';
      passwordControl?.setValue('sometyping');
      expect(component.passwordError).toBe('');
    });


  })


});
