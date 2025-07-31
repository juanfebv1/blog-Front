import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { PostList } from './post-list';
import { Auth } from '../../services/auth';
import { Component, Input, signal } from '@angular/core';
import { PostService } from '../../services/blog/post-service';
import { LikeService } from '../../services/blog/like-service';
import { postsList, mockUser } from '../../mock-data'
import { LikeResponse, PostResponse } from '../../models/post.model';
import { of, throwError } from 'rxjs';
import { RouterModule } from '@angular/router';
import { Notification } from '../../services/notification';

@Component({
  standalone: true,
  selector: 'app-post',
  template: ''
})
class MockPostComponent {
  @Input() post: any;
}

fdescribe('PostList', () => {
  let component: PostList;
  let fixture: ComponentFixture<PostList>;
  let authSpy: jasmine.SpyObj<Auth>;
  let postSpy: jasmine.SpyObj<PostService>;
  let likeSpy: jasmine.SpyObj<LikeService>;
  let mockIsLoggedInSig = signal(true);
  let responseOfGetPosts: PostResponse;
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
        'getPosts',
        'deletePost'
      ],
    );
    const mockPostList = postsList;
    responseOfGetPosts = {
      prevPage: null,
      nextPage: 'nextPageUrl',
      currentPage: 1,
      pages: 3,
      count: 23,
      results: mockPostList
    }
    postSpy.getPosts.and.returnValue(of(responseOfGetPosts));

    likeSpy = jasmine.createSpyObj('LikeService',
      [
        'likePost',
        'unlikePost',
        'deleteLike',
        'hasUserLikedPost'
      ]
    );
    likeSpy.hasUserLikedPost.and.callFake((userId, postId) => {
      const response: LikeResponse = {
        prevPage: null,
        nextPage: null,
        currentPage: 1,
        pages: 1,
        count: 0,
        results: []
      }
      if (postId < 5) {
        response.results = [
          {
            id: postId,
            post: postId,
            user: mockUser.id,
            username: mockUser.username,
            email: mockUser.email,
            liked_at: new Date('2025-07-30T16:43:02.002952Z')
          }
        ]
      }
      return of(response);
    });

    await TestBed.configureTestingModule({
      imports: [PostList, MockPostComponent, RouterModule.forRoot([])],
      providers: [
        {provide: Auth, useValue: authSpy},
        {provide: PostService, useValue: postSpy},
        {provide: LikeService, useValue: likeSpy}
      ]
    })
    .overrideComponent(PostList, {
      set: {
        imports : [MockPostComponent, RouterModule]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call get posts on init', () => {
    expect(component.prevPage).toBe(responseOfGetPosts.prevPage);
    expect(component.nextPage).toEqual(responseOfGetPosts.nextPage);
    expect(component.countPosts()).toEqual(responseOfGetPosts.count);
    expect(component.currentPage()).toEqual(responseOfGetPosts.currentPage);
  });

  it('should get posts with hasLiked flag set', fakeAsync(() => {
    const expectedPosts = responseOfGetPosts.results.map(post => ({
      ...post,
      hasLiked: post.id < 5
    }));

    tick();

    const actualPosts = component.posts();
    expect(actualPosts.length).toBe(expectedPosts.length);

    actualPosts.forEach((post, i) => {
      expect(post.hasLiked).toBe(expectedPosts[i].hasLiked);
    });
  }));

  it('should handle error when getting the posts', fakeAsync(() => {
    const errorResponse = {
        "username": [
            "custom user with this username already exists."
        ]
      }
      postSpy.getPosts.and.returnValue(
        throwError( () => ({
        error: errorResponse
        }))
      );

      fixture = TestBed.createComponent(PostList);
      component = fixture.componentInstance;
      const notificationSpy = spyOn(TestBed.inject(Notification), 'displayNotification');
      fixture.detectChanges();

      tick(3000);
      expect(notificationSpy).toHaveBeenCalledWith('Error fetching the posts', 3000)
  }));

  it('prev page posts', fakeAsync(() =>  {
    component.prevPage = 'previousPageOfPosts';
    component.prevPagePosts();

    tick();
    fixture.detectChanges();

    expect(postSpy.getPosts).toHaveBeenCalledWith('previousPageOfPosts');
    const actualPosts = component.posts();
    expect(actualPosts.length).toBe(responseOfGetPosts.results.length);
    expect(component.prevPage).toBeNull();
  }));

  it('next page posts', fakeAsync(() =>  {
    component.nextPage = 'nextPageOfPosts'; // set nextPage instead of prevPage
    component.nextPagePosts(); // <- Correct method

    tick();
    fixture.detectChanges();

    expect(postSpy.getPosts).toHaveBeenCalledWith('nextPageOfPosts');

    const actualPosts = component.posts();
    expect(actualPosts.length).toBe(responseOfGetPosts.results.length);
    expect(component.nextPage).toBe('nextPageUrl');
  }));


  it('should mark hasLiked as false if not logged in user', fakeAsync(() => {
    authSpy.currentUserSig.set(null);
    fixture = TestBed.createComponent(PostList);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.posts().forEach(post => {
      expect(post.hasLiked).toBeFalse();
    });
  }));

  







});
