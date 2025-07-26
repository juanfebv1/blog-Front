import { Component } from '@angular/core';
import { Nav } from '../../shared/nav/nav';
import { PostList } from '../post-list/post-list';

@Component({
  selector: 'app-home',
  imports: [Nav, PostList],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

}
