import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-post-create',
  imports: [ReactiveFormsModule],
  templateUrl: './post-create.html',
  styleUrl: './post-create.scss'
})
export class PostCreate {
  private formBuilder = inject(FormBuilder);

permissionOptions: Map<string, number> = new Map([
  ['None', 0],
  ['Read Only', 1],
  ['Read and Write', 2]
]);

publicPermissionOptions: Map<string , boolean> = new Map([
  ['None', false],
  ['Read Only', true]
])


  postForm = this.formBuilder.group({
    title: ['', [Validators.required]],
    content: ['', [Validators.required]],
    publicPermission: ['Read Only', [Validators.required]],
    authenticatedPermission: ['Read Only', [Validators.required, this.permissionValidator.bind(this)]],
    teamPermission: ['Read and Write', [Validators.required, this.permissionValidator.bind(this)]],
  })

  permissionValidator(control: any) {
    return this.permissionOptions.has(control.value)
    ? null
    : {invalidPermission: true}
  }

  setPermissionsHierarchy() {
    const publicPerm = this.postForm.get('publicPermission')
    if (publicPerm){
      console.log(publicPerm?.value)
      publicPerm.valueChanges.subscribe(() => {
      this.postForm.get('authenticatedPermission')?.setValue(publicPerm.value)
    })
    }
  }


  submitPost() {

  }
}
