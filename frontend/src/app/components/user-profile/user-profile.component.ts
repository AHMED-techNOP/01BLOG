import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService, Post, Comment } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { PostManagementService } from '../../services/post-management.service';
import { PostCardComponent } from '../shared/post-card/post-card.component';
import { ProfileSidebarComponent } from '../shared/profile-sidebar/profile-sidebar.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-user-profile',
  imports: [
    CommonModule,
    FormsModule,
    PostCardComponent,
    ProfileSidebarComponent,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit, OnDestroy {
  username: string = '';
  posts: Post[] = [];
  loading: boolean = true;
  error: string = '';
  currentUser: any = null;
  
  // Subscription state
  isSubscribed: boolean = false;
  subscriberCount: number = 0;
  subscriptionCount: number = 0;
  loadingSubscription: boolean = false;

  private newPostSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService,
    private postManagementService: PostManagementService
  ) {
    this.currentUser = this.authService.getUserInfo();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.username = params.get('username') || '';
      if (this.username) {
        this.loadUserPosts();
        if (!this.isCurrentUser()) {
          this.checkSubscriptionStatus();
        }
        this.loadSubscriptionStats();
      }
    });

    // Subscribe to new posts (from header) - only show on current user's profile
    this.newPostSubscription = this.postManagementService.newPost$.subscribe((newPost: Post) => {
      // Only add to list if viewing current user's profile
      if (this.isCurrentUser()) {
        this.posts.unshift(newPost);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.newPostSubscription) {
      this.newPostSubscription.unsubscribe();
    }
  }

  loadUserPosts(): void {
    this.loading = true;
    this.error = '';
    this.apiService.getUserPosts(this.username).subscribe({
      next: (posts) => {
        this.posts = posts;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load user posts:', error);
        this.error = 'Failed to load user profile';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  isCurrentUser(): boolean {
    return this.currentUser && this.currentUser.username === this.username;
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
    return this.currentUser && comment.username === this.currentUser.username;
  }

  viewUserProfile(username: string): void {
    this.router.navigate(['/profile', username]);
  }

  onCommentDeleted(event: { post: Post, comment: Comment }): void {
    this.postManagementService.deleteComment(event.post, event.comment);
  }

  // Subscription methods
  checkSubscriptionStatus(): void {
    this.apiService.checkSubscription(this.username).subscribe({
      next: (response) => {
        this.isSubscribed = response.isSubscribed;
      },
      error: (error) => {
        console.error('Failed to check subscription status:', error);
      }
    });
  }

  loadSubscriptionStats(): void {
    // Load subscriber count
    this.apiService.getSubscribers(this.username).subscribe({
      next: (subscribers) => {
        this.subscriberCount = subscribers.length;
      },
      error: (error) => {
        console.error('Failed to load subscribers:', error);
      }
    });

    // Load subscription count (people this user follows)
    this.apiService.getSubscriptions(this.username).subscribe({
      next: (subscriptions) => {
        this.subscriptionCount = subscriptions.length;
      },
      error: (error) => {
        console.error('Failed to load subscriptions:', error);
      }
    });
  }

  toggleSubscription(): void {
    if (this.loadingSubscription || this.isCurrentUser()) {
      return;
    }

    this.loadingSubscription = true;

    if (this.isSubscribed) {
      // Unsubscribe
      this.apiService.unsubscribe(this.username).subscribe({
        next: () => {
          this.isSubscribed = false;
          this.subscriberCount = Math.max(0, this.subscriberCount - 1);
          this.loadingSubscription = false;
        },
        error: (error) => {
          console.error('Failed to unsubscribe:', error);
          this.loadingSubscription = false;
          alert('Failed to unsubscribe. Please try again.');
        }
      });
    } else {
      // Subscribe
      this.apiService.subscribe(this.username).subscribe({
        next: () => {
          this.isSubscribed = true;
          this.subscriberCount++;
          this.loadingSubscription = false;
        },
        error: (error) => {
          console.error('Failed to subscribe:', error);
          this.loadingSubscription = false;
          alert('Failed to subscribe. Please try again.');
        }
      });
    }
  }
}
