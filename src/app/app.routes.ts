import { Routes } from '@angular/router';
import { Register } from './pages/register/register';
import { Login } from './pages/login/login';
import { PostDetail } from './pages/post-detail/post-detail';
import { NotFound } from './pages/not-found/not-found';
import { PostCreation } from './pages/post-creation/post-creation';
import { PostEditing } from './pages/post-editing/post-editing';
import { PostList } from './pages/post-list/post-list';

export const routes: Routes = [
  {
    path: 'register',
    component: Register
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: '',
    redirectTo: 'posts',
    pathMatch: 'full'
  },
  {
    path: 'posts',
    component: PostList
  },
  {
    path: 'posts/:id',
    component: PostDetail
  },
  {
    path: 'create',
    component: PostCreation
  },
  {
    path: 'posts/edit/:id',
    component: PostEditing
  },
  {
    path:'**',
    component: NotFound
  },
  {
    path: 'not-found',
    component: NotFound
  },


];
