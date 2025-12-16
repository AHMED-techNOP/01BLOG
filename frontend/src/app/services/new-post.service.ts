import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Post } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class NewPostService {
  private newPostSubject = new Subject<Post>();
  public newPost$ = this.newPostSubject.asObservable();

  addNewPost(post: Post): void {
    this.newPostSubject.next(post);
  }
}
