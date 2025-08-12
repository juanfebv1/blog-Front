import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostForm } from './post-form';
import { mockInitialFormDefaultValues } from '../../mock-data';
import { AbstractControl } from '@angular/forms';
import { PostCreateInterface } from '../../models/post.model';
import { Router } from '@angular/router';
import { Location as LocationService} from '@angular/common';

describe('PostForm', () => {
  let component: PostForm;
  let fixture: ComponentFixture<PostForm>;

  let locationSpy: jasmine.SpyObj<LocationService>;
  let routerSpy: jasmine.SpyObj<Router>;

  let titleCtrl: AbstractControl<any, any, any>;
  let contentCtrl: AbstractControl<any, any, any>;
  let publicCtrl: AbstractControl<any, any, any>;
  let authCtrl: AbstractControl<any, any, any>;
  let teamCtrl: AbstractControl<any, any, any>;

  beforeEach(async () => {
    locationSpy = jasmine.createSpyObj('LocationService', ['back']);
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);

    await TestBed.configureTestingModule({
      imports: [PostForm],
      providers: [
        {provide: LocationService, useValue: locationSpy},
        {provide: Router, useValue: routerSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostForm);
    component = fixture.componentInstance;
    component.initialValues = {...mockInitialFormDefaultValues};
    fixture.detectChanges();

    titleCtrl = component.form.controls['title'];
    contentCtrl = component.form.controls['content'];
    publicCtrl = component.form.controls['publicPermission'];
    authCtrl = component.form.controls['authenticatedPermission'];
    teamCtrl = component.form.controls['teamPermission'];

  });

  const grp = () => component.form;

  it('should create', () => {
    expect(component).toBeTruthy();

  });

  it('should init form and initial errors correctly', () => {
    expect(grp().getRawValue()).toEqual(mockInitialFormDefaultValues);
    expect(component.titleError).toBe('');
    expect(component.contentError).toBe('');
    expect(component.isSubmitting).toBeFalse();
  });

  describe('preservePermissionsHierarchy()', () => {
    it('should raise authenticatedPermission when publicPermission increases', () => {
      publicCtrl.setValue(true);
      expect(authCtrl.value).toBe(1);
    });

    it('should lower publicPermission when authenticatedPermission decreases', () => {
      publicCtrl.setValue(true);
      authCtrl.setValue(1);

      authCtrl.setValue(0);
      expect(publicCtrl.value).toBeFalse();
    });

    it('should raise teamPermission when authenticatedPermission increases above it', () => {
      teamCtrl.setValue(1);
      authCtrl.setValue(2);
      expect(teamCtrl.value).toBe(2);

      teamCtrl.setValue(0);
      authCtrl.setValue(1);
      expect(teamCtrl.value).toBe(1);

      teamCtrl.setValue(0);
      authCtrl.setValue(2);
      expect(teamCtrl.value).toBe(2);
    });

    it('should lower authenticatedPermission when teamPermission decreases below it', () => {
      authCtrl.setValue(1);
      teamCtrl.setValue(0);
      expect(authCtrl.value).toBe(0);

      authCtrl.setValue(2);
      teamCtrl.setValue(0);
      expect(authCtrl.value).toBe(0);

      authCtrl.setValue(2);
      teamCtrl.setValue(1);
      expect(authCtrl.value).toBe(1);
    });

    [
      { name: 'all equal 0', pub: false, auth: 0, team: 0 },
      { name: 'all equal 1', pub: true, auth: 1, team: 1 },
      { name: 'auth > pub and team == auth', pub: false, auth: 1, team: 1 },
      { name: 'auth > pub and team == auth', pub: false, auth: 2, team: 2 },
      { name: 'auth > pub and team > auth', pub: false, auth: 1, team: 2 },
      { name: 'auth == pub and team > auth', pub: false, auth: 0, team: 2 },
      { name: 'pub == auth and auth <= team', pub: true, auth: 1, team: 2}
    ].forEach(({name, pub, auth, team}) => {
      it(`should not trigger updates when hierarchy preserved (${name})`, () => {
        publicCtrl.setValue(pub);
        authCtrl.setValue(auth);
        teamCtrl.setValue(team);

        expect(publicCtrl.value).toBe(pub);
        expect(authCtrl.value).toBe(auth);
        expect(teamCtrl.value).toBe(team);
      })
    })
  });

  describe('submitPost()', () => {
    it('should emit the form if valid', () => {
      const newFormValues =
      {
        'title': 'New title',
        'content': 'New content',
        'public_permission': true,
        'authenticated_permission': 1,
        'team_permission': 2
      }

      titleCtrl.setValue(newFormValues.title);
      contentCtrl.setValue(newFormValues.content);
      publicCtrl.setValue(newFormValues.public_permission);
      authCtrl.setValue(newFormValues.authenticated_permission);
      teamCtrl.setValue(newFormValues.team_permission);


      const spy = spyOn(component.submitForm, 'emit');

      component.submitPost();

      const actualForm: PostCreateInterface = {
        title: titleCtrl.value,
        content: contentCtrl.value,
        public_permission: publicCtrl.value,
        authenticated_permission: authCtrl.value,
        team_permission: teamCtrl.value
      };
      expect(spy).toHaveBeenCalledOnceWith(actualForm);
    });

    it('should call handleValidationErrors() when invalid form', () => {
      titleCtrl.setValue('');
      expect(grp().invalid).toBeTrue();

      const spy = spyOn(component, 'handleValidationErrors');
      component.submitPost();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('handleValidationErrors()', () => {
    it('title should be required', () => {
      titleCtrl.setValue('');
      fixture.detectChanges();
      component.handleValidationErrors();

      expect(component.titleError).toBeTruthy();
    });

    it('content should be required', () => {
      contentCtrl.setValue('');
      fixture.detectChanges();
      component.handleValidationErrors();

      expect(component.contentError).toBeTruthy();
    });
  })

  it('should reset errors when value changes', () => {
    component.titleError = 'Some error';
    titleCtrl.setValue('some title');
    expect(component.titleError).toBe('');

    component.contentError = 'Some error';
    contentCtrl.setValue('Some content');
    expect(component.contentError).toBe('');
  })

});
