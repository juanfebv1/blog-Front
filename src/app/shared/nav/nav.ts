import { Component, effect, inject } from '@angular/core';
import { Auth } from '../../services/auth';
import { UserProfile } from '../../models/user.model';
import { RouterLink } from '@angular/router';
import { Dialog, DIALOG_DATA, DialogModule, DialogRef } from '@angular/cdk/dialog';
import { tap } from 'rxjs';
import { Notification } from '../../services/notification';

@Component({
  selector: 'app-nav',
  imports: [RouterLink, DialogModule,],
  templateUrl: './nav.html',
  styleUrl: './nav.scss'
})
export class Nav {
  private authService = inject(Auth);
  private logoutDialog = inject(Dialog);
  private notification = inject(Notification);

  user: UserProfile | null | undefined = undefined;

  constructor() {
    effect( () => {
      this.user = this.authService.currentUserSig();
    })
  }

  onLogout() {
    this.logoutDialog.open(ConfirmLogoutDialog, {
          minWidth: '300px',
          data: true
        }).closed.pipe(
          tap((data) => {
            if (data) {
              this.authService.logout();
              this.notification.displayNotification('Successfully logged out', 3000);
            }
          }
        )).subscribe();
  }

  get shortUsername(): string {
    if (!this.user?.username) return '';
    return this.user.username.length < 15
      ? this.user.username
      : this.user.username.slice(0, 14) + '...';
  }

  get longUsername(): string {
    if (!this.user?.username) return '';
    return this.user.username.length < 22
    ? this.user.username
    : this.user.username.slice(0, 21) + '...';
  }

}

@Component({
  selector: 'logout-dialog',
  template:`
    <div class="logout-dialog">
      <h2>You’re about to log out. Do you want to continue?</h2>
      <div class="buttons">
        <button class="confirm-logout" (click)="confirmLogout.close(data)">Log out</button>
        <button (click)="confirmLogout.close()">Cancel</button>
      </div>
    </div>
  `,
  styleUrl: './nav.scss'
})
export class ConfirmLogoutDialog {
  confirmLogout = inject<DialogRef<boolean>>(DialogRef<boolean>)
  data = inject(DIALOG_DATA);
}
