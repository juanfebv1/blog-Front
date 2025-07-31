import { CreateUserDTO, UserProfile } from './../../models/user.model';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { Register } from './register';
import { Auth } from '../../services/auth';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { Component, signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { Notification } from '../../services/notification';

@Component({template: ''})
class DummyLoginComponent {}

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;
  let authSpy: jasmine.SpyObj<Auth>;  
  let mockIsLoggedInSig = signal(false);

  beforeEach(async () => {
   authSpy = jasmine.createSpyObj('Auth',
    ['register'],
    {
      isLoggedInSig: mockIsLoggedInSig
    }
  );

    await TestBed.configureTestingModule({
      imports: [
        Register,
        ReactiveFormsModule,
        RouterModule.forRoot([
          {path: 'login', component: DummyLoginComponent}
        ])
      ],
      providers: [
        {provide: Auth, useValue: authSpy}
      ]
    })
    .compileComponents();

    fixture   = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    fixture.detectChanges();
  })

  const grp = () => component.registerForm
  const formValues = {
    email: 'correctemail@email.com',
    username: 'test',
    password: 'tst',
    confirmPassword: 'tst'
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to home if user already logged in', fakeAsync(() => {
    mockIsLoggedInSig.set(true);
    const routerSpy = spyOn(TestBed.inject(Router), 'navigateByUrl');

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(routerSpy).toHaveBeenCalledWith('');
    })
  );


  it('register submit button should be disabled when submitting', () => {
    component.isSubmitting = true;
    fixture.detectChanges();
    const submitButton = fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement;
    expect(submitButton.disabled).toBeTrue();
  });

  describe('register form validation', () => {

    it('form starts empty', () => {
      const form = grp();
      expect(form.get('email')?.value).toBe('');
      expect(form.get('password')?.value).toBe('');
      expect(form.get('confirmPassword')?.value).toBe('');
      expect(form.get('username')?.value).toBe('');
    });

    it('email should be required', () => {
      grp().setValue(formValues);
      grp().patchValue({email: ''});
      expect(grp().get('email')?.valid).toBeFalse();
      expect(grp().valid).toBeFalse();
      component.register();
      expect(component.emailError).toBe('Email required')
    });

    it('email should have correct format', () => {
      grp().setValue(formValues);
      grp().patchValue({email: 'badEmail'});
      expect(grp().get('email')?.valid).toBeFalse();
      expect(grp().valid).toBeFalse();
      component.register();
      expect(component.emailError).toBe('Invalid email')
    })

    it('username should be required', () => {
      grp().setValue(formValues);
      grp().patchValue({username: ''})
      expect(grp().get('username')?.valid).toBeFalse();
      expect(grp().valid).toBeFalse();
      component.register();
      expect(component.usernameError).toBe('Username required')
    });

    it('password should be required', () => {
      grp().setValue(formValues);
      grp().patchValue({password: ''});
      expect(grp().get('password')?.valid).toBeFalse();
      expect(grp().valid).toBeFalse();
      component.register();
      expect(component.passwordError).toBe('Password required')
    });

    it('password confirmation should be required', () => {
      grp().setValue(formValues);
      grp().patchValue({confirmPassword: ''});
      expect(grp().get('confirmPassword')?.valid).toBeFalse();
      expect(grp().valid).toBeFalse();
      component.register();
      expect(component.confirmPasswordError).toBe('Password confirmation required')
    });

    it('password confirmation should be the same as password', () => {
      const form = grp();
      const formWithoutConfirmPassword = {
        email: 'test@email.com',
        username: 'test',
        password: 'test',
        confirmPassword: 'testDifferent'
      };
      form.setValue(formWithoutConfirmPassword)
      expect(form.valid).toBeFalse();
      component.register();
      expect(component.confirmPasswordError).toBe('Passwords do not match')
    });

  });

  describe('submit behavior', () => {
    it('should register successfully on valid form', fakeAsync(() => {
      const form = grp()
      form.setValue(formValues);
      expect(form.valid).toBeTrue();

      const mockResponse: UserProfile = {
        id: 1,
        email: "correctemail@email.com",
        username: "test",
        team: 1,
        team_name: "default"
      }
      authSpy.register.and.returnValue(of(mockResponse));
      const notificationSpy = spyOn(TestBed.inject(Notification), 'displayNotification')
      const routerSpy = spyOn(TestBed.inject(Router), 'navigateByUrl');

      component.register();

      const expectedRequestData: CreateUserDTO = {
        email: formValues.email,
        username: formValues.username,
        password: formValues.password
      }

      expect(component.isSubmitting).toBeTrue();
      expect(authSpy.register).toHaveBeenCalledWith(expectedRequestData);


      tick(1500);
      expect(notificationSpy).toHaveBeenCalledOnceWith(
        'Registration successful!',
        1500
      );
      expect(routerSpy).toHaveBeenCalledWith('/login');
    }));

    it('should handle email already exists error from backend on register', () => {
      component.registerForm.setValue(formValues);
      const errorResponse = {
        "email": [
            "custom user with this email address already exists."
        ]
      }
      authSpy.register.and.returnValue(
        throwError( () => ({
        error: errorResponse
        }))
      );
      component.register();
      expect(component.emailError).toBe('This email already exists')
      expect(component.isSubmitting).toBe(false);
    });

    it('should handle username already exists error from backend on register', () => {
      component.registerForm.setValue(formValues);
      const errorResponse = {
        "username": [
            "custom user with this username already exists."
        ]
      }
      authSpy.register.and.returnValue(
        throwError( () => ({
        error: errorResponse
        }))
      );
      component.register();
      expect(component.usernameError).toBe('This username already exists')
      expect(component.isSubmitting).toBe(false);
    });

    it('should display generic error bar when backend responds unknown error', () => {
      component.registerForm.setValue(formValues);
      const errorResponse = {
        "unknown_error": [
            "unknown error details"
        ]
      }
      authSpy.register.and.returnValue(
        throwError( () => ({
        error: errorResponse
        }))
      );
      const notificationSpy = spyOn(TestBed.inject(Notification), 'displayNotification')

      component.register();
      expect(component.emailError).toBe('');
      expect(component.usernameError).toBe('');
      expect(component.passwordError).toBe('');
      expect(component.confirmPasswordError).toBe('');
      expect(notificationSpy).toHaveBeenCalledOnceWith(
        'Ops, something happened. Try again, please.',
        3000
      );
    });

  })

  describe('resetTouchAfterSubmit' ,() => {

    it('should reset email errors message when value changes', () => {
      const emailControl = component.registerForm.get('email');
      component.emailError = 'This email already exists';
      emailControl?.setValue('sometyping');
      expect(component.emailError).toBe('');
    });

    it('should reset username errors message when value changes', () => {
      const usernameControl = component.registerForm.get('username');
      component.usernameError = 'Username is required';
      usernameControl?.setValue('sometyping');
      expect(component.usernameError).toBe('');
    });

    it('should reset password error message when value changes', () => {
      const passwordControl = component.registerForm.get('password');
      component.passwordError = 'Password is required';
      passwordControl?.setValue('sometyping');
      expect(component.passwordError).toBe('');
    });

    it('should reset confirm password error when value changes', () => {
      const confirmPasswordControl = component.registerForm.get('confirmPassword');
      component.confirmPasswordError = 'Password confrimation is required';
      confirmPasswordControl?.setValue('sometyping');
      expect(component.confirmPasswordError).toBe('');
    });

  })


});

