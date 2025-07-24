import { Component, effect, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../services/auth';
import { CreateUserDTO } from '../../models/user.model';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar} from '@angular/material/snack-bar';

const REDIRECT_DELAY = 1500;

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {

  private formBuilder = inject(FormBuilder);
  private authService = inject(Auth);
  private router = inject(Router)
  private snackBar = inject(MatSnackBar);

  emailTaken = false;
  usernameTaken = false;

  emailError = '';
  usernameError = '';
  passwordError = '';

  constructor() {
    this.resetTouchedAfterSubmit();
    effect( () => {
      if (this.authService.isLoggedInSig()) this.router.navigateByUrl('')
    })
  }

resetTouchedAfterSubmit() {
  this.registerForm.get('email')?.valueChanges.subscribe(() => {
    this.emailError = '';
    this.emailTaken = false;
  });

  this.registerForm.get('username')?.valueChanges.subscribe(() => {
    this.usernameError = '';
    this.usernameTaken = false;
  });

  this.registerForm.get('password')?.valueChanges.subscribe(() => {
    this.passwordError = '';
  });

  this.registerForm.get('confirmPassword')?.valueChanges.subscribe(() => {
    this.passwordError = '';
  });
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


  register() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.handleValidationErrorMessage();
      return;
    }

    const form = this.registerForm.value;
    const dataUser: CreateUserDTO = {
      email: form.email ?? '',
      username: form.username ?? '',
      password: form.password ?? ''
    };
    this.authService.register(dataUser)
    .subscribe({
      next: () => {
        this.snackBar.open('Registration successful!', 'Close', {
          duration: REDIRECT_DELAY,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        setTimeout(() => this.router.navigateByUrl('/login'), REDIRECT_DELAY)
      },
      error: (response) => this.handleErrorRegister(response)
    })
  }

  handleValidationErrorMessage() {
    const emailControl = this.registerForm.get('email');
    const usernameControl = this.registerForm.get('username');
    const passwordControl = this.registerForm.get('password');
    const confirmPasswordControl = this.registerForm.get('confirmPassword');

    if (emailControl?.invalid && emailControl.touched) {
      this.emailError = emailControl.hasError('required') ? 'Email required' : 'Incorrect email';
    }

    if (usernameControl?.invalid && usernameControl.touched) {
      this.usernameError = 'Username is required';
    }

    if (passwordControl?.invalid && passwordControl.touched) {
      this.passwordError = 'Password is required';
    }

    if (confirmPasswordControl?.touched) {
      if (confirmPasswordControl.hasError('required')) {
        this.passwordError = 'Password confirmation is required';
      } else if (this.registerForm.hasError('passwordMismatch')) {
        this.passwordError = 'Passwords do not match';
      }
    }
  }


  handleErrorRegister(response: HttpErrorResponse) : void{
    const msg = response.error;
    const email = msg['email'];
    const username = msg['username'];
    if (email) {
      this.emailError = 'This email already exists'
    }
    else if (username) {
      this.usernameError = 'This username already exists'
    }
    else {
      this.snackBar.open('Ops, something happened!', 'Close', {
        duration: REDIRECT_DELAY,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    }
  }



}
