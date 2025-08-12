import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';

import { PostDetail } from './post-detail';
import { signal, WritableSignal } from '@angular/core';
import { Auth } from '../../services/auth';
import { PostService } from '../../services/blog/post-service';
import { LikeService } from '../../services/blog/like-service';
import { mockBasePost, mockComment, mockCommentLongList, mockCommentShortList, mockUser } from '../../mock-data';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommentService } from '../../services/blog/comment-service';
import { of, count, delay } from 'rxjs';
import { UserProfile } from '../../models/user.model';

describe('PostDetail', () => {
  let component: PostDetail;
  let fixture: ComponentFixture<PostDetail>;

  let authSpy: jasmine.SpyObj<Auth>;
  let postSpy: jasmine.SpyObj<PostService>;
  let commentSpy: jasmine.SpyObj<CommentService>;
  let mockIsLoggedInSig = signal(true);
  let mockUserSig: WritableSignal<UserProfile| null | undefined> = signal(mockUser);

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj('Auth',
      [],
      {
        isLoggedInSig: mockIsLoggedInSig,
        currentUserSig: mockUserSig
      }
     );

     postSpy = jasmine.createSpyObj('PostService',
      ['getPost']
     );
     postSpy.getPost.and.returnValue(of(mockBasePost));

     commentSpy = jasmine.createSpyObj('CommentService',
      ['getComments', 'commentPost']
     )
     commentSpy.getComments.and.returnValue(of(mockCommentShortList));
     commentSpy.commentPost.and.returnValue(of(mockComment));
     const mockRoute = {
      paramMap: of({
        get: (key: string) => key === 'id' ? `${mockBasePost.id}` : null
      })
    }

    await TestBed.configureTestingModule({
      imports: [
        PostDetail,
        RouterModule.forRoot([])
      ],
      providers: [
        {provide: Auth, useValue: authSpy},
        {provide: PostService, useValue: postSpy},
        {provide: CommentService, useValue: commentSpy},
        {provide: ActivatedRoute, useValue: mockRoute}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.post.id).toEqual(mockBasePost.id);
    expect(component.status).toBe('ready');
  });

  it('should correctly get comments when less than PAGE_SIZE', () => {
    component.comments?.forEach((comment, index) => {
      expect(comment).toEqual(mockCommentShortList.results[index])
    });
    expect(component.commentCount()).toBe(mockBasePost.count_comments);
    expect(component.currentPageComments()).toBe(mockCommentShortList.currentPage);
    expect(component.prevPageComments).toBe(mockCommentShortList.prevPage);
    expect(component.nextPageComments).toBe(mockCommentShortList.nextPage);
    expect(component.startComment()).toBe(1);
    expect(component.endComment()).toBe(mockCommentShortList.count);
  });

  it('should correctly get the comments when more than PAGE_SIZE', () => {
    const COMMENT_PAGE_SIZE = 5;
    commentSpy.getComments.and.returnValue(of(mockCommentLongList));
    const mockPostWithManyComments = {...mockBasePost, count_comments: mockCommentLongList.count};
    postSpy.getPost.and.returnValue(of(
      mockPostWithManyComments
    ));
    fixture = TestBed.createComponent(PostDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.comments?.forEach((comment, index) => {
      expect(comment).toEqual(mockCommentLongList.results[index])
    });
    expect(component.commentCount()).toBe(mockCommentLongList.count);
    expect(component.currentPageComments()).toBe(mockCommentLongList.currentPage);
    expect(component.prevPageComments).toBe(mockCommentLongList.prevPage);
    expect(component.nextPageComments).toBe(mockCommentLongList.nextPage);
    expect(component.startComment()).toBe(1);
    expect(component.endComment()).toBe(COMMENT_PAGE_SIZE);
  });

  it('should allow user to comment', () => {
    expect(component.userCanComment).toBeTrue();
    expect(component.newComment).toBe('');
    const addCommentElement = fixture.nativeElement.querySelector('.add-comment-container');
    expect(addCommentElement).toBeTruthy();
  });

  it('should not allow comment if not logged in', () => {
    mockIsLoggedInSig.set(false);
    mockUserSig.set(null);

    fixture = TestBed.createComponent(PostDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.userCanComment).toBeFalse();
    const addCommentElement = fixture.nativeElement.querySelector('.add-comment-container');
    expect(addCommentElement).toBeFalsy();

    mockIsLoggedInSig.set(true);
    mockUserSig.set(mockUser);
  });

  describe('submitComment()', () => {
    it('should call comment service with correct post ID and payload', () => {
      component.newComment = 'Some new comment for test';
      fixture.detectChanges();

      component.submitComment();
      expect(commentSpy.commentPost).toHaveBeenCalledOnceWith(component.post.id, 'Some new comment for test');
      expect(component.newComment).toBe('');
      expect(component.isSubmitting).toBeFalse();
    });

    it('should update comments list', fakeAsync(() => {
      const newTestComment = 'Some new comment for test';
      component.newComment = newTestComment;

      component.submitComment();
      fixture.detectChanges();

      expect(component.comments?.some((comment) =>
        comment.user === mockUser.id &&
        comment.content === newTestComment
      )).toBeTrue();
    })
    );
  })

});
