import { Component, effect, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../services/auth';
import { CreateUserDTO } from '../../models/user.model';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { Notification } from '../../services/notification';

const REDIRECT_DELAY = 1500;
const ERROR_DELAY = 3000;

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {

  private formBuilder = inject(FormBuilder);
  private authService = inject(Auth);
  private router = inject(Router)
  private notify = inject(Notification);

  emailError = '';
  usernameError = '';
  passwordError = '';
  confirmPasswordError = '';

  isSubmitting = false;

  constructor() {
    this.resetTouchedAfterSubmit();
    effect( () => {
      if (this.authService.isLoggedInSig()) this.router.navigateByUrl('')
    })
  }

  registerForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    username: ['', Validators.required],
    password: ['', [Validators.required]],
    confirmPassword: ['', Validators.required]
  },
  {
    validators: this.matchingPasswordValidator
  })

  matchingPasswordValidator(form: AbstractControl): {passwordMismatch: true} | null{
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : {passwordMismatch: true}
  }

  resetTouchedAfterSubmit() {
    this.registerForm.get('email')?.valueChanges.subscribe(() => {
      this.emailError = '';
    });

    this.registerForm.get('username')?.valueChanges.subscribe(() => {
      this.usernameError = '';
    });

    this.registerForm.get('password')?.valueChanges.subscribe(() => {
      this.passwordError = '';
      this.confirmPasswordError = '';
    });

    this.registerForm.get('confirmPassword')?.valueChanges.subscribe(() => {
      this.confirmPasswordError = '';
    });
  }

  register() {
    if (this.registerForm.invalid) {
      this.handleValidationErrorMessage();
      return;
    }

    this.isSubmitting = true;

    const form = this.registerForm.value;
    const dataUser: CreateUserDTO = {
      email: form.email ?? '',
      username: form.username ?? '',
      password: form.password ?? ''
    };
    this.authService.register(dataUser)
    .subscribe({
      next: () => {
        this.notify.displayNotification('Registration successful!', REDIRECT_DELAY)
        setTimeout(() => this.router.navigateByUrl('/login'), REDIRECT_DELAY)
      },
      error: (response) => {
        this.handleErrorRegister(response);
        this.isSubmitting = false;
      }
    })
  }

  handleValidationErrorMessage() {
    const emailControl = this.registerForm.get('email');
    const usernameControl = this.registerForm.get('username');
    const passwordControl = this.registerForm.get('password');
    const confirmPasswordControl = this.registerForm.get('confirmPassword');

    if (emailControl?.invalid) {
      this.emailError = emailControl.hasError('required') ? 'Email required' : 'Invalid email';
    }

    if (usernameControl?.invalid) {
      this.usernameError = 'Username required';
    }

    if (passwordControl?.invalid ) {
      this.passwordError = 'Password required';
    }

    if (confirmPasswordControl?.invalid) {
      this.confirmPasswordError = 'Password confirmation required';
    } else if (this.registerForm.hasError('passwordMismatch')) {
      this.confirmPasswordError = 'Passwords do not match';
    }

  }

  handleErrorRegister(response: HttpErrorResponse) : void{
    const msg = response.error;
    const email: string[] = msg['email'];
    const username: string[] = msg['username'];
    if(email &&  email.some((str) => /already exists/.test(str.toLocaleLowerCase()))) {
      this.emailError = 'This email already exists'
    }
    else if (username && username.some((str) => /already exists/.test(str.toLocaleLowerCase()))) {
      this.usernameError = 'This username already exists'
    }
    else {
      this.notify.displaySomethingWentWrong();
    }
  }
}
