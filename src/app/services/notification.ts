import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class Notification {
  private snackBarNot = inject(MatSnackBar);

  displayNotification(message: string, duration: number) {
    this.snackBarNot.open(message, 'Close', {
      duration: duration,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  displaySomethingWentWrong() {
    this.displayNotification(
      'Something went wrong', 3000
    )
  }
}
