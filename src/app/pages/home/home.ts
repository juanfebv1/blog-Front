import { Component } from '@angular/core';
import { Nav } from '../../shared/nav/nav';
import { PostList } from '../post-list/post-list';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [PostList],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

}
