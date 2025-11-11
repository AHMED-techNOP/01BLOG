import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  user: any = null;
  loading: boolean = true;

  constructor(
    private authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    // Fetch current user from backend to validate token
    // If token is invalid, backend returns 401 and HTTP interceptor logs out
    this.apiService.getCurrentUser().subscribe({
      next: (userData) => {
        this.user = userData;
        this.loading = false;
        console.log('User data loaded from backend:', userData);
      },
      error: (error) => {
        console.error('Failed to load user data:', error);
        this.loading = false;
        // HTTP interceptor will handle 401 and logout automatically
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
