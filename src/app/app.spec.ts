import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { Auth } from './services/auth';
import { RouterModule } from '@angular/router';

describe('App', () => {
  let authSpy: jasmine.SpyObj<Auth>;

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj('Auth', ['init'])

    await TestBed.configureTestingModule({
      imports: [App, RouterModule.forRoot([])],
      providers: [
        {provide: Auth, useValue: authSpy}
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

});
