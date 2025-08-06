import { Component, inject } from '@angular/core';
import { Nav } from '../../shared/nav/nav';
import { PostList } from '../post-list/post-list';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [PostList],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  private router = inject(Router);

  goCreate() {
    this.router.navigateByUrl('create');
  }
}
