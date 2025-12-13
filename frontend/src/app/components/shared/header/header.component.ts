import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { PostManagementService } from '../../../services/post-management.service';
import { CreatePostComponent } from '../create-post/create-post.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    CreatePostComponent
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  user: any = null;
  isAuthenticated: boolean = false;
  showCreatePost: boolean = false;
  editingPost: any = null;
  private routerSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private postManagementService: PostManagementService
  ) {}

  ngOnInit(): void {
    // Check authentication state on init and route changes
    this.updateAuthState();
    
    // Subscribe to router events to update auth state on navigation
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateAuthState();
    });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  updateAuthState(): void {
    this.isAuthenticated = this.authService.isLoggedIn;
    if (this.isAuthenticated) {
      this.user = this.authService.getUserInfo();
    } else {
      this.user = null;
    }
  }

  viewMyProfile(): void {
    if (this.user && this.user.username) {
      this.router.navigate(['/profile', this.user.username]);
    }
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  createPost(): void {
    this.showCreatePost = true;
  }

  closeCreatePost(): void {
    this.showCreatePost = false;
    this.editingPost = null;
  }

  onPostCreated(post: any): void {
    this.showCreatePost = false;
    // Notify dashboard about the new post
    this.postManagementService.addNewPost(post);
    // Navigate to dashboard to see the new post
    if (this.router.url !== '/dashboard') {
      this.router.navigate(['/dashboard']);
    }
  }

  onPostUpdated(post: any): void {
    this.showCreatePost = false;
  }

  logout(): void {
    this.authService.logout();
  }
}
