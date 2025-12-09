import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ApiService, Post } from '../../services/api.service';
import { CreatePostComponent } from './create-post/create-post.component';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, CreatePostComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  user: any = null;
  posts: Post[] = [];
  loading: boolean = true;
  showCreatePost: boolean = false;
  activeMenuPostId: number | null = null;
  editingPost: Post | null = null;

  constructor(
    private authService: AuthService,
    private apiService: ApiService
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

  openCreatePost(): void {
    this.showCreatePost = true;
  }

  closeCreatePost(): void {
    this.showCreatePost = false;
    this.editingPost = null;
  }

  onPostCreated(newPost: Post): void {
    // Add new post to the top of the list
    this.posts.unshift(newPost);
    this.showCreatePost = false;
  }

  isImage(mediaUrl: string): boolean {
    if (!mediaUrl) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return imageExtensions.some(ext => mediaUrl.toLowerCase().endsWith(ext));
  }

  isVideo(mediaUrl: string): boolean {
    if (!mediaUrl) return false;
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
    return videoExtensions.some(ext => mediaUrl.toLowerCase().endsWith(ext));
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
    this.editingPost = post;
    this.showCreatePost = true;
    this.closeMenu();
  }

  deletePost(postId: number): void {
    this.apiService.deletePost(postId).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p.id !== postId);
        this.closeMenu();
      },
      error: (error) => {
        console.error('Failed to delete post:', error);
        alert('Failed to delete post');
      }
    });
  }

  onPostUpdated(updatedPost: Post): void {
    const index = this.posts.findIndex(p => p.id === updatedPost.id);
    if (index !== -1) {
      this.posts[index] = updatedPost;
    }
    this.editingPost = null;
    this.showCreatePost = false;
  }

  onEditCancel(): void {
    this.editingPost = null;
    this.showCreatePost = false;
  }
}
