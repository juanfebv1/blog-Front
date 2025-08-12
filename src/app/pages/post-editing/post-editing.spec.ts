import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';

import { PostEditing } from './post-editing';
import { Auth } from '../../services/auth';
import { PostService } from '../../services/blog/post-service';
import { signal } from '@angular/core';
import { mockBasePost, mockBasePostResponse, mockUser } from '../../mock-data';
import { PostForm } from '../../shared/post-form/post-form';
import { of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { PostCreateInterface, PostFormInterface, PostInterfaceResponse } from '../../models/post.model';
import { By } from '@angular/platform-browser';

fdescribe('PostEditing', () => {
  let component: PostEditing;
  let fixture: ComponentFixture<PostEditing>;

  let authSpy: jasmine.SpyObj<Auth>;
  let postSpy: jasmine.SpyObj<PostService>;
  let routeSpy: any;
  let routerSpy: jasmine.SpyObj<Router>;

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
        'getPost',
        'editPost'
      ],
    );
    postSpy.getPost.and.returnValue(of(mockBasePostResponse));
    postSpy.editPost.and.returnValue(of(mockBasePostResponse));
    routeSpy = { paramMap: of({ get: (key: string) => '1' }) };

    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl'])

    await TestBed.configureTestingModule({
      imports: [PostEditing, PostForm],
      providers: [
        {provide: Auth, useValue: authSpy},
        {provide: PostService, useValue: postSpy},
        {provide: ActivatedRoute, useValue: routeSpy},
        {provide: Router, useValue: routerSpy}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostEditing);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should successfully init with post information', () => {
    const initialFormExpected: PostFormInterface = {
      title: mockBasePost.title,
      content: mockBasePost.content,
      publicPermission: mockBasePost.public_permission,
      authenticatedPermission: mockBasePost.authenticated_permission,
      teamPermission: mockBasePost.team_permission
    };

    const fixture = TestBed.createComponent(PostEditing);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.initialValues).toEqual(initialFormExpected);
    expect(component.postId).toBe(mockBasePost.id);
    expect(component.status).toBe('ready');
  });

  it('should throw error when invalid url', () => {
    routeSpy.paramMap = of({ get: () => 'invalidId' });

    const fixture = TestBed.createComponent(PostEditing);
    fixture.detectChanges();

    expect(routerSpy.navigateByUrl).toHaveBeenCalledOnceWith('not-found');
  });

  it('should throw error when user cannot edit', () => {
    const mockPrivatePostResponse: PostInterfaceResponse = {
      ...mockBasePostResponse,
      public_permission: false,
      authenticated_permission: 1,
      team_permission: 1
    }
    postSpy.getPost.and.returnValue(of(mockPrivatePostResponse));

    const fixture = TestBed.createComponent(PostEditing);
    fixture.detectChanges();

    expect(routerSpy.navigateByUrl).toHaveBeenCalledOnceWith('not-found');
  });

  describe('saveChanges()', () => {
    it('should call saveChanges when emitted form', () => {
      const postFormDebugEl = fixture.debugElement.query(By.directive(PostForm));
      const postFormComponent = postFormDebugEl.componentInstance as PostForm;

      spyOn(component, 'saveChanges');

      const mockPost: PostCreateInterface = {
        title: 'Title',
        content: 'Content',
        public_permission: true,
        authenticated_permission: 1,
        team_permission: 2
      };

      postFormComponent.submitForm.emit(mockPost);

      expect(component.saveChanges).toHaveBeenCalledOnceWith(mockPost);
    });

    it('should call editPost correctly', fakeAsync(() => {
      const mockPost: PostCreateInterface = {
        title: 'Title',
        content: 'Content',
        public_permission: true,
        authenticated_permission: 1,
        team_permission: 2
      };
      component.saveChanges(mockPost);
      expect(postSpy.editPost).toHaveBeenCalledOnceWith(1, mockPost);
      flush();
      expect(routerSpy.navigateByUrl).toHaveBeenCalledOnceWith('/posts/1')
      })
    )


  })
});
