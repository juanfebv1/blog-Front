import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostCreation } from './post-creation';

describe('PostCreation', () => {
  let component: PostCreation;
  let fixture: ComponentFixture<PostCreation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostCreation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostCreation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
