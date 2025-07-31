import { Routes } from '@angular/router';
import { Register } from './pages/register/register';
import { Login } from './pages/login/login';
import { Home } from './pages/home/home';
import { PostDetail } from './pages/post-detail/post-detail';
import { NotFound } from './pages/not-found/not-found';

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
    component: Home
  },
  {
    path: 'posts/:id',
    component: PostDetail
  },
  {
    path:'**',
    component: NotFound
  },
  {
    path: 'not-found',
    component: NotFound
  }
];
