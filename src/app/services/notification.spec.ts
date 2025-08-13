import { TestBed } from '@angular/core/testing';

import { Notification } from './notification';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('Notification', () => {
  let service: Notification;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Notification);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should open snack bar when displayNotification() is called', () => {
    const snackSpy = spyOn(TestBed.inject(MatSnackBar), 'open');
    const msg = 'Some message to be displayed';
    const duration = 2000;

    service.displayNotification(msg, duration);
    expect(snackSpy).toHaveBeenCalledOnceWith(msg, 'Close', {
      duration: duration,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    })
  });

  it('displaySomethingWentWrong()', () => {
    const snackSpy = spyOn(TestBed.inject(MatSnackBar), 'open');
    service.displaySomethingWentWrong();

    expect(snackSpy).toHaveBeenCalledOnceWith('Something went wrong', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    })
  })
});
