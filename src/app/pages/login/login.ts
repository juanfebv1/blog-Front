import { Component, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private formBuilder = inject(FormBuilder);
  private authService = inject(Auth);
  private router = inject(Router)

  constructor() {
    effect( () => {
      if (this.authService.isLoggedInSig()) this.router.navigateByUrl('')
    })
  }

  loginForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  })

  login() {
    const payload = {
      email: this.loginForm.get('email')?.value ?? '',
      password: this.loginForm.get('password')?.value ?? ''
    }
    this.authService.login(payload)
    .subscribe(
      (response) => {
        console.log(response);
        console.log(this.authService.currentUserSig());
        this.router.navigate(['']);
      }
    )
  }
}
