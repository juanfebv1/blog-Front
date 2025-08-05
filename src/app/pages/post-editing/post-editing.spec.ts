import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostEditing } from './post-editing';

describe('PostEditing', () => {
  let component: PostEditing;
  let fixture: ComponentFixture<PostEditing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostEditing]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostEditing);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
