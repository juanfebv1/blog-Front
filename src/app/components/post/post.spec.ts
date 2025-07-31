import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Post } from './post';
import { Auth } from '../../services/auth';
import { PostService } from '../../services/blog/post-service';
import { LikeService } from '../../services/blog/like-service';
import { signal, WritableSignal } from '@angular/core';
import { likesList, mockBasePost, mockUser } from '../../mock-data';
import { of } from 'rxjs';
import { UserProfile } from '../../models/user.model';

fdescribe('Post user logged in', () => {
  let component: Post;
  let fixture: ComponentFixture<Post>;
  let authSpy: jasmine.SpyObj<Auth>;
  let postSpy: jasmine.SpyObj<PostService>;
  let likeSpy: jasmine.SpyObj<LikeService>;
  let mockIsLoggedInSig = signal(true);
  let mockUserSig = signal(mockUser);

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj('Auth',
      [],
      {
        isLoggedInSig: mockIsLoggedInSig,
        currentUserSig: mockUserSig
      }
     );

     postSpy = jasmine.createSpyObj('PostService',
      ['deletePost']
     );

     likeSpy = jasmine.createSpyObj('LikeService',
      [
        'getLikes',
        'likePost',
        'unlikePost'
      ]
     );
     likeSpy.getLikes.and.returnValue(of(likesList));


    await TestBed.configureTestingModule({
      imports: [Post],
      providers: [
        {provide: Auth, useValue: authSpy},
        {provide: PostService, useValue: postSpy},
        {provide: LikeService, useValue: likeSpy}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Post);
    component = fixture.componentInstance;
    component.post = mockBasePost;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize correctly with post and user info', () => {
    expect(component.currentUserId).toEqual(mockUser.id)
    expect(component.likesCount).toEqual(mockBasePost.count_likes);
    expect(component.showEditButtons).toBeFalse();
    expect(component.likeFromCurrentUser).toBeTrue();
  });

  describe('userCanEdit()', () => {
    it('should allow edit if user owns the post', () => {
      fixture = TestBed.createComponent(Post);
      component = fixture.componentInstance;
      component.post = {...mockBasePost, email:"user@email.com"};
      fixture.detectChanges();
      expect(component.showEditButtons).toBeTrue();
    });

    it('should allow edit if auth permission is edit', () => {
      fixture = TestBed.createComponent(Post);
      component = fixture.componentInstance;
      component.post = {...mockBasePost, authenticated_permission: 2};
      fixture.detectChanges();
      expect(component.showEditButtons).toBeTrue();
    });

    it('should allow edit if team permission is edit and user same team', () => {
      fixture = TestBed.createComponent(Post);
      component = fixture.componentInstance;
      component.post = {...mockBasePost, team_permission: 2};
      fixture.detectChanges();
      expect(component.showEditButtons).toBeTrue();
    });

    it('should not allow edit if auth permission 1 and different team', () => {
      const mockUserDiffTeam = {...mockUser, team: 2};
      mockUserSig.set(mockUserDiffTeam);
      fixture = TestBed.createComponent(Post);
      component = fixture.componentInstance;
      component.post = {...mockBasePost, authenticated_permission: 1, team_permission: 2};
      fixture.detectChanges();
      expect(component.showEditButtons).toBeFalse();
    });

    it('should not allow edit if private post', () => {
      fixture = TestBed.createComponent(Post);
      component = fixture.componentInstance;
      component.post = {...mockBasePost, team_permission: 0};
      fixture.detectChanges();
      expect(component.showEditButtons).toBeFalse();
    });

    describe('onLikePost()', () => {
      it('should call likePost', () => {
        component.onLikePost();
        expect(likeSpy.likePost).toHaveBeenCalledOnceWith(component.post.id);
      });

      it('should update like info', () => {

      })

    })
  })
});

fdescribe('Post when user not logged in', () => {
  let component: Post;
  let fixture: ComponentFixture<Post>;
  let authSpy: jasmine.SpyObj<Auth>;
  let postSpy: jasmine.SpyObj<PostService>;
  let likeSpy: jasmine.SpyObj<LikeService>;
  let mockIsLoggedInSig = signal(true);
  let mockUserSig: WritableSignal<UserProfile | null | undefined> = signal(mockUser);

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj('Auth',
      [],
      {
        isLoggedInSig: mockIsLoggedInSig,
        currentUserSig: mockUserSig
      }
     );

     postSpy = jasmine.createSpyObj('PostService',
      ['deletePost']
     );

     likeSpy = jasmine.createSpyObj('LikeService',
      [
        'getLikes',
        'likePost',
        'unlikePost'
      ]
     );
     likeSpy.getLikes.and.returnValue(of(likesList));


    await TestBed.configureTestingModule({
      imports: [Post],
      providers: [
        {provide: Auth, useValue: authSpy},
        {provide: PostService, useValue: postSpy},
        {provide: LikeService, useValue: likeSpy}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Post);
    component = fixture.componentInstance;
    component.post = mockBasePost;
    fixture.detectChanges();
  });

  it('should not', () => {

  })
})
