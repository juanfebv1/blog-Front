import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { Post } from './post';
import { Auth } from '../../services/auth';
import { PostService } from '../../services/blog/post-service';
import { LikeService } from '../../services/blog/like-service';
import { signal, WritableSignal } from '@angular/core';
import { likesList, LongLikeList, mockBasePost, mockLike, mockUser } from '../../mock-data';
import { of } from 'rxjs';
import { UserProfile } from '../../models/user.model';
import { LikeResponse } from '../../models/post.model';
import { RouterModule } from '@angular/router';

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
     likeSpy.likePost.and.returnValue(of(mockLike));
     likeSpy.unlikePost.and.returnValue(of({}));


    await TestBed.configureTestingModule({
      imports: [Post, RouterModule.forRoot([])],
      providers: [
        {provide: Auth, useValue: authSpy},
        {provide: PostService, useValue: postSpy},
        {provide: LikeService, useValue: likeSpy}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Post);
    component = fixture.componentInstance;
    component.post = {...mockBasePost};
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize correctly with post and user info', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    expect(component.post.count_likes).toEqual(mockBasePost.count_likes);
    expect(component.userCanEdit).toBeFalse();
    expect(component.post.hasLiked).toBeTrue();
  }));

  it('should interact with post', () => {
    const interactElement = fixture.nativeElement.querySelector('.interact-buttons');
    expect(interactElement).toBeTruthy();
  })

  describe('userCanEdit()', () => {
    it('should allow edit if user owns the post', () => {
      fixture = TestBed.createComponent(Post);
      component = fixture.componentInstance;
      component.post = {...mockBasePost, email:"user@email.com"};
      fixture.detectChanges();
      expect(component.userCanEdit).toBeTrue();
    });

    it('should allow edit if auth permission is edit', () => {
      fixture = TestBed.createComponent(Post);
      component = fixture.componentInstance;
      component.post = {...mockBasePost, authenticated_permission: 2};
      fixture.detectChanges();
      expect(component.userCanEdit).toBeTrue();
    });

    it('should allow edit if team permission is edit and user same team', () => {
      fixture = TestBed.createComponent(Post);
      component = fixture.componentInstance;
      component.post = {...mockBasePost, team_permission: 2};
      fixture.detectChanges();
      expect(component.userCanEdit).toBeTrue();
    });

    it('should not allow edit if auth permission 1 and different team', () => {
      const mockUserDiffTeam = {...mockUser, team: 2};
      mockUserSig.set(mockUserDiffTeam);
      fixture = TestBed.createComponent(Post);
      component = fixture.componentInstance;
      component.post = {...mockBasePost, authenticated_permission: 1, team_permission: 2};
      fixture.detectChanges();
      expect(component.userCanEdit).toBeFalse();
      mockUserSig.set(mockUser);
    });

    it('should not allow edit if private post', () => {
      fixture = TestBed.createComponent(Post);
      component = fixture.componentInstance;
      component.post = {...mockBasePost, team_permission: 0};
      fixture.detectChanges();
      expect(component.userCanEdit).toBeFalse();
    });
  })

  describe('onLikePost()', () => {
    it('should call likePost', () => {
      component.onLikePost();
      expect(likeSpy.likePost).toHaveBeenCalledOnceWith(component.post.id);
    });

    it('should update like info when list of likes is less than PAGE_SIZE', () => {
      fixture = TestBed.createComponent(Post);
      component = fixture.componentInstance;
      component.post = {...mockBasePost, hasLiked: false};
      fixture.detectChanges();
      component.onLikePost();
      expect(component.post.hasLiked).toBeTrue();
      expect(component.post.count_likes).toBe(mockBasePost.count_likes + 1);
      expect(component.likes.some((like) => like.user === authSpy.currentUserSig()?.id)).toBeTrue();
    });

    it('should correctly update like info when list of likes is greater than PAGE_SIZE', () => {
      fixture = TestBed.createComponent(Post);
      component = fixture.componentInstance;

      component.post = {...mockBasePost, hasLiked: false, count_likes: 15};
      const oldPost = {...component.post};
      const mockLikeList: LikeResponse = {...LongLikeList, count: 16};
      likeSpy.getLikes.and.returnValue(of(mockLikeList));

      fixture.detectChanges();

      component.onLikePost();
      expect(component.post.hasLiked).toBeTrue();
      expect(component.post.count_likes).toBe(oldPost.count_likes + 1);
      expect(component.likes.length).toEqual(15);
      expect(component.likes.some((like) => like.user === authSpy.currentUserSig()?.id)).toBeTrue();
    });
  });

  describe('onUnlikePost()', () => {
    it('should call unlikePost', () => {
      component.onUnlikePost();
      expect(likeSpy.unlikePost).toHaveBeenCalledOnceWith(mockUser.id, component.post.id);
    });

    it('should update like info when list of likes is less than PAGE_SIZE', () => {
      fixture = TestBed.createComponent(Post);
      component = fixture.componentInstance;
      component.post = {...mockBasePost, hasLiked: true};
      fixture.detectChanges();
      component.onUnlikePost();
      expect(component.post.hasLiked).toBeFalse();
      expect(component.post.count_likes).toBe(mockBasePost.count_likes - 1);
      expect(component.likes.some((like) => like.user === authSpy.currentUserSig()?.id)).toBeFalse();
    });

    it('should correctly update like info when list of likes is greater than PAGE_SIZE', () => {
      fixture = TestBed.createComponent(Post);
      component = fixture.componentInstance;

      component.post = { ...mockBasePost, hasLiked: true, count_likes: 16 };
      component.likes = [...LongLikeList.results];
      const oldPost = { ...component.post };
      const mockLikeList: LikeResponse = { ...LongLikeList, count: 15 };
      likeSpy.getLikes.and.returnValue(of(mockLikeList));
      likeSpy.unlikePost.and.returnValue(of({}));

      fixture.detectChanges();

      component.onUnlikePost();

      expect(component.post.hasLiked).toBeFalse();
      expect(component.post.count_likes).toBe(oldPost.count_likes - 1);
      expect(component.likes.length).toEqual(14);
      expect(component.likes.some((like) => like.user === authSpy.currentUserSig()?.id)).toBeFalse();
    });

  });

  describe('onShowLikes()', () => {
    it('should toggle to true and call getLikes correctly', () => {
      component.showLikes = false;
      component.onShowLikes();
      expect(component.showLikes).toBeTrue();
      expect(likeSpy.getLikes).toHaveBeenCalled();
      expect(component.likes.length).toBe(likesList.count)
    });

    it('should toggle to false', () => {
      component.showLikes = true;
      component.onShowLikes();
      expect(component.showLikes).toBeFalse();
    })
  });

  describe('onDelete()', () => {
    it('should open delete dialog and call deletePost on confirm', fakeAsync(() => {
      const dialogRefMock = { closed: of(component.post.id) };
      const deleteDialogSpy = spyOn(component['deleteDialog'], 'open').and.returnValue(dialogRefMock as any);

      postSpy.deletePost.and.returnValue(of({}));

      component.onDelete();
      tick();

      expect(deleteDialogSpy).toHaveBeenCalled();
      expect(postSpy.deletePost).toHaveBeenCalledWith(component.post.id);
    }));
    
  })
});

fdescribe('Post when user not logged in', () => {
  let component: Post;
  let fixture: ComponentFixture<Post>;
  let authSpy: jasmine.SpyObj<Auth>;
  let postSpy: jasmine.SpyObj<PostService>;
  let likeSpy: jasmine.SpyObj<LikeService>;
  let mockIsLoggedInSig = signal(false);
  let mockUserSig: WritableSignal<UserProfile | null | undefined> = signal(null);

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
      imports: [Post, RouterModule.forRoot([])],
      providers: [
        {provide: Auth, useValue: authSpy},
        {provide: PostService, useValue: postSpy},
        {provide: LikeService, useValue: likeSpy}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Post);
    component = fixture.componentInstance;
    component.post = {...mockBasePost};
    fixture.detectChanges();
  });

  it('should not interact with post', () => {
    const interactElement = fixture.nativeElement.querySelector('.interact-buttons');
    expect(interactElement).toBeFalsy();
  });


})
