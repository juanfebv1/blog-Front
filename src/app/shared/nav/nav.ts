import { HttpClient } from '@angular/common/http';
import { Component, effect, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Token } from '../../services/token';
import { Auth } from '../../services/auth';
import { UserProfile } from '../../models/user.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-nav',
  imports: [RouterLink],
  templateUrl: './nav.html',
  styleUrl: './nav.scss'
})
export class Nav {
  private http = inject(HttpClient);
  private authService = inject(Auth);

  private apiUrl = environment.apiUrl;
  user: UserProfile | null | undefined = undefined;

  constructor() {
    effect( () => {
      this.user = this.authService.currentUserSig();
    })
  }

  onLogout() {
    this.authService.logout();
  }



}
