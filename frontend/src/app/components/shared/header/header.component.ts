import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { NewPostService } from '../../../services/new-post.service';
import { CreatePostComponent } from '../create-post/create-post.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { NotificationService, Notification } from '../../../services/notification.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatBadgeModule,
    MatMenuModule,
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
  unreadCount: number = 0;
  notifications: Notification[] = [];
  isErrorPage: boolean = false;
  private routerSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private newPostService: NewPostService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Check authentication state on init and route changes
    this.updateAuthState();
    this.checkErrorPage();
    
    // Subscribe to router events to update auth state on navigation
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateAuthState();
      this.checkErrorPage();
    });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  loadNotifications(): void {
    this.notificationService.getUnreadNotifications().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.unreadCount = notifications.filter(n => !n.read).length;
      }
    });
  }

  markAsRead(notification: Notification): void {
    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        notification.read = true;
        this.unreadCount = this.notifications.filter(n => !n.read).length;
        // Navigate to post if available
        if (notification.postId) {
          this.router.navigate(['/dashboard']); // or navigate to specific post
        }
      }
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.read = true);
        this.unreadCount = 0;
      }
    });
  }

  updateAuthState(): void {
    this.isAuthenticated = this.authService.isLoggedIn;
    if (this.isAuthenticated) {
      this.user = this.authService.getUserInfo();
      this.loadNotifications();
    } else {
      this.user = null;
      this.notifications = [];
    }
  }

  checkErrorPage(): void {
    this.isErrorPage = this.router.url.startsWith('/error');
  }

  viewMyProfile(): void {
    if (this.user && this.user.username) {
      this.router.navigate(['/profile', this.user.username]);
    }
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goToAdmin(): void {
    this.router.navigate(['/admin']);
  }

  goToUserSearch(): void {
    this.router.navigate(['/users']);
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
    // Notify user-profile about the new post
    this.newPostService.addNewPost(post);
  }

  onPostUpdated(post: any): void {
    this.showCreatePost = false;
  }

  logout(): void {
    this.authService.logout();
  }
}
