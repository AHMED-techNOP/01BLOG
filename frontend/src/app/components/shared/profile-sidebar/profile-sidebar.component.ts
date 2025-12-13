import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-profile-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './profile-sidebar.component.html',
  styleUrl: './profile-sidebar.component.css'
})
export class ProfileSidebarComponent implements OnInit, OnChanges {
  @Input() username: string = '';
  @Input() subscriberCount: number = 0;
  @Input() subscriptionCount: number = 0;
  @Input() postCount: number = 0;
  @Input() isCurrentUser: boolean = false;
  @Input() isSubscribed: boolean = false;
  @Input() loadingSubscription: boolean = false;
  @Input() showBackButton: boolean = false;
  @Input() showViewProfileButton: boolean = false;
  @Input() autoLoadStats: boolean = true; // Auto-load stats if not provided

  @Output() backClicked = new EventEmitter<void>();
  @Output() subscriptionToggled = new EventEmitter<void>();
  @Output() viewProfileClicked = new EventEmitter<void>();

  private statsLoaded: boolean = false;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    if (this.autoLoadStats) {
      this.loadSubscriptionStats();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['username'] && !changes['username'].firstChange && this.autoLoadStats) {
      this.loadSubscriptionStats();
    }
  }

  private loadSubscriptionStats(): void {
    if (!this.username || this.statsLoaded) return;
    
    // Load subscriber count
    this.apiService.getSubscribers(this.username).subscribe({
      next: (subscribers) => {
        this.subscriberCount = subscribers.length;
      },
      error: (error) => {
        console.error('Failed to load subscribers:', error);
      }
    });

    // Load subscription count
    this.apiService.getSubscriptions(this.username).subscribe({
      next: (subscriptions) => {
        this.subscriptionCount = subscriptions.length;
      },
      error: (error) => {
        console.error('Failed to load subscriptions:', error);
      }
    });

    // Load post count
    this.apiService.getUserPosts(this.username).subscribe({
      next: (posts) => {
        this.postCount = posts.length;
      },
      error: (error) => {
        console.error('Failed to load posts:', error);
      }
    });

    this.statsLoaded = true;
  }

  onBackClick(): void {
    this.backClicked.emit();
  }

  onSubscriptionToggle(): void {
    this.subscriptionToggled.emit();
  }

  onViewProfileClick(): void {
    this.viewProfileClicked.emit();
  }
}
