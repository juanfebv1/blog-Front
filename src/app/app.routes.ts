import { Routes } from '@angular/router';
import { Register } from './pages/register/register';
import { Login } from './pages/login/login';
import { Home } from './pages/home/home';
import { PostDetail } from './pages/post-detail/post-detail';

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
    component: Home
  },
  {
    path: 'posts/:id',
    component: PostDetail
  }
];
