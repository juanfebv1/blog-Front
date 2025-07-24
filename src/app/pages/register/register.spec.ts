import { CreateUserDTO } from './../../models/user.model';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Register } from './register';
import { Auth } from '../../services/auth';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule } from '@angular/forms';
import { Component } from '@angular/core';

@Component({template: ''})
class DummyLoginComponent {}

fdescribe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;

  let router: Router
  let authSpy: Auth;

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj("Auth", ["register", "isLoggedInSig"]);

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

    router = TestBed.inject(Router);

  })

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('register form validation', () => {

    const grp = () => component.registerForm
    const formValues = {
      email: "badEmail",
      username: 'test',
      password: 'tst',
      confirmPassword: 'tst'
    }

    it('form starts empty', () => {
      const form = grp();
      expect(form.get('email')?.value).toBe('');
      expect(form.get('password')?.value).toBe('');
      expect(form.get('confirmPassword')?.value).toBe('');
      expect(form.get('username')?.value).toBe('');
    });

    it('email should be required', () => {
      grp().setValue(formValues);
      grp().patchValue({email: ""})
      expect(grp().valid).toBeFalse();
    });

    it('email should have correct format', () => {
      grp().setValue(formValues);
      grp().patchValue({email: 'badEmail'});
      expect(grp().get('email')?.valid).toBeFalse();
      expect(grp().valid).toBeFalse();
    })

    it('username should be required', () => {
      grp().setValue(formValues);
      grp().patchValue({username: ''})
      expect(grp().get('username')?.valid).toBeFalse();
      expect(grp().valid).toBeFalse();
    });

    it('password should be required', () => {
      grp().setValue(formValues);
      grp().patchValue({password: ''});
      expect(grp().get('password')?.valid).toBeFalse();
      expect(grp().valid).toBeFalse();
    });

    it('password confirmation should be required', () => {
      grp().setValue(formValues);
      grp().patchValue({confirmPassword: ''});
      expect(grp().get('confirmPassword')?.valid).toBeFalse();
      expect(grp().valid).toBeFalse();
    });

    it('password confirmation should be the same', () => {
      const form = grp();
      const formWithoutConfirmPassword = {
        email: 'test@email.com',
        username: 'test',
        password: 'test',
        confirmPassword: 'testDifferent'
      };
      form.setValue(formWithoutConfirmPassword)
      expect(form.valid).toBeFalse();
    })


  })

});

