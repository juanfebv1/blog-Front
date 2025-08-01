import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Auth } from './services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'blog';
  private authService = inject(Auth);

  constructor() {
    this.authService.init();
  }
}
