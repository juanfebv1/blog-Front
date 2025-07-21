import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { Auth } from '../../services/auth';
import { CreateUserDTO, UserCreatedDTO } from '../../models/user.model';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { pipe, tap } from 'rxjs';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {

  private formBuilder = inject(FormBuilder);
  private registerService = inject(Auth);

  emailTaken = false;
  usernameTaken = false;

  constructor() {
    this.resetTouchedAfterSubmit();
  }

  resetTouchedAfterSubmit() {
    this.registerForm.get('email')?.valueChanges.subscribe(() => {
      if (this.emailTaken) this.emailTaken = false;

      this.registerForm.get('email')?.markAsUntouched();
    });

    this.registerForm.get('username')?.valueChanges.subscribe(() => {
      if (this.usernameTaken) this.usernameTaken = false;

      this.registerForm.get('username')?.markAsUntouched();
    })

  }


  registerForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    username: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['']
  },
  {
    validators: this.matchingPasswordValidator
  })

  get showEmailError(): boolean {
    const control = this.registerForm.get('email');
    return !!control && control.invalid && control.touched;
  }

  get showEmailRequired(): boolean {
    const control = this.registerForm.get('email');
    return !!control && control.hasError('required') && control.touched;
  }

  get showUsernameError(): boolean {
    const control = this.registerForm.get('username');
    return !!control && control.invalid && control.touched;
  }

  get showPasswordRequired(): boolean {
    const control = this.registerForm.get('password');
    return !!control && control.hasError('required') && control.touched
  }

  get showPasswordError(): boolean {
    const control = this.registerForm.get('password');
    return !!control && control.invalid && control.touched;
  }

  get showMismatchPasswordError(): boolean {
    const form = this.registerForm;
    const confirmedPassword = form.get('confirmPassword')
    return !!form && form.hasError('passwordMismatch') && !!confirmedPassword?.touched;
  }

  matchingPasswordValidator(form: AbstractControl): {passwordMismatch: true} | null{
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : {passwordMismatch: true}
  }


  register() {
    if (this.registerForm.invalid) {
      return;
    }

    const form = this.registerForm.value;
    const dataUser: CreateUserDTO = {
      email: form.email ?? '',
      username: form.username ?? '',
      password: form.password ?? ''
    };
    this.registerService.register(dataUser)
    .subscribe({
      next: (response) => console.log('Created: ', response),
      error: (response) => this.handleErrorRegister(response)
    })
  }

  handleErrorRegister(response: HttpErrorResponse) : void{
    const msg = response.error;
    const email = msg['email'];
    const username = msg['username']
    if (email) {
      this.emailTaken = true;
    }
    else if (username) {
      this.usernameTaken = true;
    }
    else {
    window.alert('Something is wrong.')
    }
  }



}
