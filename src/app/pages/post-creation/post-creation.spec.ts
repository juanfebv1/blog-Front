import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';

import { PostCreation } from './post-creation';
import { Auth } from '../../services/auth';
import { PostService } from '../../services/blog/post-service';
import { signal } from '@angular/core';
import { mockUser } from '../../mock-data';
import { Router } from '@angular/router';
import { PostCreateInterface, PostInterfaceResponse } from '../../models/post.model';
import { of } from 'rxjs';
import { Notification } from '../../services/notification';
import { PostForm } from '../../shared/post-form/post-form';
import { By } from '@angular/platform-browser';

describe('PostCreation', () => {
  let component: PostCreation;
  let fixture: ComponentFixture<PostCreation>;

  let authSpy: jasmine.SpyObj<Auth>;
  let postSpy: jasmine.SpyObj<PostService>;

  let mockIsLoggedInSig = signal(true);
  let mockUserSig = signal(mockUser);

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj('Auth',
      ['login'],
      {
        isLoggedInSig: mockIsLoggedInSig,
        currentUserSig: mockUserSig
      }
    );
    postSpy= jasmine.createSpyObj('PostService',
      [
        'createPost'
      ],
    );

    await TestBed.configureTestingModule({
      imports: [PostCreation, PostForm],
      providers: [
        {provide: Auth, useValue: authSpy},
        {provide: PostService, useValue: postSpy},
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostCreation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to login if not logged in', () => {
    const routerSpy = spyOn(TestBed.inject(Router), 'navigateByUrl');
    mockIsLoggedInSig.set(false);
    fixture.detectChanges();

    expect(routerSpy).toHaveBeenCalledOnceWith('login');

    mockIsLoggedInSig.set(true);
  });

  describe('Post submission', () => {
    it('should call onSubmitPost() with emitted form', () => {
      const postFormDebugEl = fixture.debugElement.query(By.directive(PostForm));
      const postFormComponent = postFormDebugEl.componentInstance as PostForm;

      spyOn(component, 'onSubmitPost');

      const mockPost: PostCreateInterface = {
        title: 'Title',
        content: 'Content',
        public_permission: true,
        authenticated_permission: 1,
        team_permission: 2
      };

      postFormComponent.submitForm.emit(mockPost);

      expect(component.onSubmitPost).toHaveBeenCalledOnceWith(mockPost);
    })

    it('redirect to post detail when created', fakeAsync(() => {
      const post: PostCreateInterface = {
        title: 'Some title',
        content: 'Some content',
        public_permission: true,
        authenticated_permission: 1,
        team_permission: 2
      };

      const postResponse: PostInterfaceResponse = {
        "id": 208,
        "title": "Some title",
        "content": "Some content",
        "username": "breyner",
        "email": "breyner@email.com",
        "team": 1,
        "team_name": "default_team",
        "posted_on": "2025-08-11T23:49:55.545822Z",
        "authenticated_permission": 1,
        "team_permission": 2,
        "public_permission": true,
        "count_likes": 0,
        "count_comments": 0
      }
      postSpy.createPost.and.returnValue(of(postResponse));

      const notificationSpy = spyOn(TestBed.inject(Notification), 'displayNotification');
      const routerSpy = spyOn(TestBed.inject(Router), 'navigateByUrl');

      component.onSubmitPost(post);
      flush();

      expect(postSpy.createPost).toHaveBeenCalledOnceWith(post);
      expect(notificationSpy).toHaveBeenCalledOnceWith('Post successfully created',1500);
      expect(routerSpy).toHaveBeenCalledOnceWith('');
    })
    )
  })
});
