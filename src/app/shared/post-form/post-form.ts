import { Component, EventEmitter, inject, Input, OnInit, Output, Query } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../services/auth';
import { PostService } from '../../services/blog/post-service';
import { Router } from '@angular/router';
import { PostCreateInterface } from '../../models/post.model';
import { Notification } from '../../services/notification';
import { Location } from '@angular/common';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import type { Editor } from '@ckeditor/ckeditor5-core';

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [ReactiveFormsModule, CKEditorModule],
  templateUrl: './post-form.html',
  styleUrl: './post-form.scss'
})
export class PostForm implements OnInit {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private location = inject(Location);



  @Input() initialValues!: {
    title: string;
    content: string;
    publicPermission: boolean;
    authenticatedPermission: number;
    teamPermission: number;
  };

  @Output() submitForm = new EventEmitter<PostCreateInterface>();

  form!: FormGroup;

  public Editor = ClassicEditor
  editorConfig = {
    placeholder: 'Write your content here...',
    toolbar: [
      'heading', '|',
      'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', '|',
      'undo', 'redo'
    ]
  };

  titleError = '';
  contentError = '';

  @Input() submitButtonName!: string;
  isSubmitting = false;

  permissionOptions = [
    { key: 0, label: 'None' },
    { key: 1, label: 'Read Only' },
    { key: 2, label: 'Read and Edit' }
  ];

  publicPermissionOptions = [
    { key: false, label: 'None' },
    { key: true, label: 'Read Only' }
  ];

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      title: [this.initialValues.title, [Validators.required]],
      content: [this.initialValues.content, [Validators.required]],
      publicPermission: [this.initialValues.publicPermission, [Validators.required]],
      authenticatedPermission: [this.initialValues.authenticatedPermission, [Validators.required]],
      teamPermission: [this.initialValues.teamPermission, [Validators.required]],
      authorPermission: [2, [Validators.required]]
    });

    this.preservePermissionsHierarchy();
    this.resetErrors();
  }

  preservePermissionsHierarchy() {
    const publicCtrl = this.form.controls['publicPermission'];
    const authenticatedCtrl = this.form.controls['authenticatedPermission'];
    const teamCtrl = this.form.controls['teamPermission'];

    publicCtrl.valueChanges.subscribe((value) => {
      const publicCtrlValue = value ? 1 : 0;
      if (publicCtrlValue > authenticatedCtrl.value) {
        authenticatedCtrl.setValue(publicCtrlValue);
      }
    });

    authenticatedCtrl.valueChanges.subscribe((value) => {
      const publicCtrlValue = publicCtrl.value ? 1 : 0;
      if (publicCtrlValue > value) {
        publicCtrl.setValue(value > 0);
      }
      if (value > teamCtrl.value) {
        teamCtrl.setValue(value);
      }
    });

    teamCtrl.valueChanges.subscribe((value) => {
      if (authenticatedCtrl.value > value) {
        authenticatedCtrl.setValue(value);
      }
    });
  }

  submitPost() {
    if (this.form.invalid) {
      this.handleValidationErrors();
      return;
    }

    this.isSubmitting = true;

    const actualForm: PostCreateInterface = {
      title: this.form.controls['title'].value,
      content: this.form.controls['content'].value,
      public_permission: this.form.controls['publicPermission'].value,
      authenticated_permission: this.form.controls['authenticatedPermission'].value,
      team_permission: this.form.controls['teamPermission'].value
    };

    this.submitForm.emit(actualForm);
  }

  onCancel() {
    const previousUrl = document.referrer;
    const origin = window.location.origin;

    if (previousUrl.includes(origin)) {
      this.location.back();
    } else {
      this.router.navigateByUrl('');
    }
  }

  handleValidationErrors() {
    const titleCtrl = this.form.controls['title'];
    const contentCtrl = this.form.controls['content'];

    if (titleCtrl.invalid) {
      this.titleError = 'Title required';
    }
    if (contentCtrl.invalid) {
      this.contentError = 'Content required';
    }
  }

  resetErrors() {
    const titleCtrl = this.form.controls['title'];
    const contentCtrl = this.form.controls['content'];

    titleCtrl.valueChanges.subscribe(() => {
      this.titleError = '';
    });

    contentCtrl.valueChanges.subscribe(() => {
      this.contentError = '';
    });
  }
}
