import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService, User } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './user-search.component.html',
  styleUrls: ['./user-search.component.css']
})
export class UserSearchComponent implements OnInit {
  searchQuery: string = '';
  users: User[] = [];
  filteredUsers: User[] = [];
  loading: boolean = false;
  currentUserId: number | null = null;

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadAllUsers();
    this.getCurrentUser();
  }

  getCurrentUser() {
    this.authService.currentUser$.subscribe(user => {
      if (user && user.id) {
        this.currentUserId = user.id;
      }
    });
  }

  loadAllUsers() {
    this.loading = true;
    this.apiService.getAllUsers().subscribe({
      next: (users: User[]) => {
        this.users = users.filter((user: User) => user.id !== this.currentUserId);
        this.filteredUsers = this.users;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading users:', error);
        this.loading = false;
      }
    });
  }

  onSearch() {
    if (!this.searchQuery.trim()) {
      this.filteredUsers = this.users;
      return;
    }

    const query = this.searchQuery.toLowerCase().trim();
    this.filteredUsers = this.users.filter(user =>
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  }

  toggleSubscribe(user: User) {
    if (user.isSubscribed) {
      this.unsubscribe(user);
    } else {
      this.subscribe(user);
    }
  }

  subscribe(user: User) {
    this.apiService.subscribe(user.username).subscribe({
      next: (response) => {
        user.isSubscribed = response.isSubscribed;
        user.subscriberCount = response.subscriberCount;
      },
      error: (error: any) => {
        console.error('Error subscribing:', error);
        alert('Failed to subscribe to user');
      }
    });
  }

  unsubscribe(user: User) {
    this.apiService.unsubscribe(user.username).subscribe({
      next: (response) => {
        user.isSubscribed = response.isSubscribed;
        user.subscriberCount = response.subscriberCount;
      },
      error: (error: any) => {
        console.error('Error unsubscribing:', error);
        alert('Failed to unsubscribe from user');
      }
    });
  }
}
