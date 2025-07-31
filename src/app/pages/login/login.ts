import { Component, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from '../../services/notification';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  private formBuilder = inject(FormBuilder);
  private authService = inject(Auth);
  private router = inject(Router);
  private notification = inject(Notification);

  invalidCredentialsError = '';
  emailError = '';
  passwordError = '';
  isSubmitting = false;

  constructor() {
    this.resetTouchedAfterSubmit();
    effect( () => {
      if (this.authService.isLoggedInSig()) this.router.navigateByUrl('')
    })
  }

  loginForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  resetTouchedAfterSubmit() {
    this.loginForm.get('email')?.valueChanges.subscribe(() => {
      this.emailError = '';
      this.invalidCredentialsError = '';
    });

    this.loginForm.get('password')?.valueChanges.subscribe(() => {
      this.passwordError = '';
      this.invalidCredentialsError = '';
    });
  }

  login() {
    if(this.loginForm.invalid) {
      this.handleValidationErrorMessages();
      return;
    }

    this.isSubmitting = true;

    const payload = {
      email: this.loginForm.get('email')?.value ?? '',
      password: this.loginForm.get('password')?.value ?? ''
    }
    this.authService.login(payload)
    .subscribe({
      next: () => {
        this.router.navigateByUrl('');
      },
      error: (response) => {
        this.handleErrorLogin(response);
      }
    })
  }

  handleValidationErrorMessages() {
    const emailControl = this.loginForm.get('email');
    const passwordControl = this.loginForm.get('password');

    if (emailControl?.invalid) {
      this.emailError = emailControl.hasError('required') ? 'Email required' : 'Invalid email';
    }

    if (passwordControl?.invalid ) {
      this.passwordError = 'Password required';
    }
  }

  handleErrorLogin(response: HttpErrorResponse) {
    this.isSubmitting = false;
    const msg = response.error;
    const details = msg['detail'];
    if (/credentials/.test(details)){
      this.invalidCredentialsError = 'Invalid credentials';
    }
    else {
      this.notification.displayNotification('Ops, something happened', 3000);
    }
  }
}
