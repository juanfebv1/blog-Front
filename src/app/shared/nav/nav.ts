import { Component, effect, inject } from '@angular/core';
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
  private authService = inject(Auth);

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
