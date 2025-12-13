import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ApiService, Post, Comment } from '../../services/api.service';
import { PostManagementService } from '../../services/post-management.service';
import { CreatePostComponent } from '../shared/create-post/create-post.component';
import { PostCardComponent } from '../shared/post-card/post-card.component';
import { ProfileSidebarComponent } from '../shared/profile-sidebar/profile-sidebar.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    FormsModule,
    CreatePostComponent,
    PostCardComponent,
    ProfileSidebarComponent,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component-material.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  user: any = null;
  posts: Post[] = [];
  loading: boolean = true;
  showCreatePost: boolean = false;
  activeMenuPostId: number | null = null;
  editingPost: Post | null = null;
  private editModalSubscription?: Subscription;
  private newPostSubscription?: Subscription;

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

    // Subscribe to edit modal changes
    this.editModalSubscription = this.postManagementService.editModal$.subscribe(({ post, show }) => {
      this.editingPost = post;
      this.showCreatePost = show;
    });

    // Subscribe to new posts (from header)
    this.newPostSubscription = this.postManagementService.newPost$.subscribe((newPost: Post) => {
      // Add new post to the top of the list
      this.posts.unshift(newPost);
    });
  }

  ngOnDestroy(): void {
    if (this.editModalSubscription) {
      this.editModalSubscription.unsubscribe();
    }
    if (this.newPostSubscription) {
      this.newPostSubscription.unsubscribe();
    }
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

  openCreatePost(): void {
    this.showCreatePost = true;
  }

  viewMyProfile(): void {
    if (this.user && this.user.username) {
      this.router.navigate(['/profile', this.user.username]);
    }
  }

  closeCreatePost(): void {
    this.postManagementService.closeEditModal();
  }

  onPostCreated(newPost: Post): void {
    this.posts = this.postManagementService.handlePostCreation(newPost, this.posts);
  }
    
  isCurrentUserPost(post: Post): boolean {
    return this.user && post.username === this.user.username;
  }

  toggleMenu(postId: number, event: Event): void {
    event.stopPropagation();
    this.activeMenuPostId = this.activeMenuPostId === postId ? null : postId;
  }

  closeMenu(): void {
    this.activeMenuPostId = null;
  }

  editPost(post: Post): void {
    this.postManagementService.openEditModal(post);
  }

  deletePost(postId: number): void {
    this.postManagementService.deletePost(postId, this.posts).then(
      (updatedPosts) => {
        this.posts = updatedPosts;
      }
    ).catch(() => {
      // User cancelled or error occurred
    });
  }

  onPostUpdated(updatedPost: Post): void {
    this.posts = this.postManagementService.handlePostUpdate(updatedPost, this.posts);
  }

  onEditCancel(): void {
    this.editingPost = null;
    this.showCreatePost = false;
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
