import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService, Post, Comment } from '../../services/api.service';
import { PostManagementService } from '../../services/post-management.service';
import { PostCardComponent } from '../shared/post-card/post-card.component';
import { ProfileSidebarComponent } from '../shared/profile-sidebar/profile-sidebar.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    FormsModule,
    PostCardComponent,
    ProfileSidebarComponent,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component-material.css'
})
export class DashboardComponent implements OnInit {
  user: any = null;
  posts: Post[] = [];
  loading: boolean = true;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router,
    private postManagementService: PostManagementService
  ) {
    // Get user info from token (no backend call needed)
    this.user = this.authService.getUserInfo();
  }

  ngOnInit(): void {
    // Fetch posts from backend
    this.loadPosts();
  }

  loadPosts(): void {
    this.loading = true;
    this.apiService.getSubscribedUsersposts().subscribe({
      next: (posts) => {
        this.posts = posts;
        this.loading = false;
      },
    });
  }

  logout(): void {
    this.authService.logout();
  }

  viewMyProfile(): void {
    if (this.user && this.user.username) {
      this.router.navigate(['/profile', this.user.username]);
    }
  }

  viewUserProfile(username: string): void {
    this.router.navigate(['/profile', username]);
  }

  toggleLike(post: Post): void {
    this.postManagementService.toggleLike(post);
  }

  toggleComments(post: Post): void {
    this.postManagementService.toggleComments(post);
  }

  addComment(post: Post): void {
    this.postManagementService.addComment(post);
  }

  isCurrentUserComment(comment: Comment): boolean {
    return this.user && comment.username === this.user.username;
  }

  onCommentDeleted(event: { post: Post, comment: Comment }): void {
    this.postManagementService.deleteComment(event.post, event.comment);
  }
}
