import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService, AdminUser, AdminPost, AdminReport } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatBadgeModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  currentUser: any = null;
  selectedTab = 0;
  loading = false;

  // Users
  users: AdminUser[] = [];
  userColumns: string[] = ['id', 'username', 'email', 'role', 'postCount', 'followerCount', 'createdAt', 'actions'];

  // Posts
  posts: AdminPost[] = [];
  postColumns: string[] = ['id', 'title', 'username', 'likeCount', 'commentCount', 'createdAt', 'actions'];

  // Reports
  reports: AdminReport[] = [];
  reportColumns: string[] = ['id', 'reporter', 'reported', 'type', 'reason', 'status', 'timestamp', 'actions'];

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser = this.authService.getUserInfo();
  }

  ngOnInit(): void {
    // Check if user is admin
    if (!this.currentUser || this.currentUser.role !== 'ADMIN') {
      alert('Access denied. Admin privileges required.');
      this.router.navigate(['/dashboard']);
      return;
    }

    this.loadAllData();
  }

  loadAllData(): void {
    this.loadUsers();
    this.loadPosts();
    this.loadReports();
  }

  // Users Methods
  loadUsers(): void {
    this.loading = true;
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load users:', error);
        this.loading = false;
        alert('Failed to load users');
      }
    });
  }

  banUser(user: AdminUser): void {
    if (!confirm(`Are you sure you want to ban user "${user.username}"?`)) {
      return;
    }

    this.adminService.banUser(user.id).subscribe({
      next: () => {
        user.isBanned = true;
        alert(`User "${user.username}" has been banned`);
      },
      error: (error) => {
        console.error('Failed to ban user:', error);
        alert('Failed to ban user');
      }
    });
  }

  unbanUser(user: AdminUser): void {
    this.adminService.unbanUser(user.id).subscribe({
      next: () => {
        user.isBanned = false;
        alert(`User "${user.username}" has been unbanned`);
      },
      error: (error) => {
        console.error('Failed to unban user:', error);
        alert('Failed to unban user');
      }
    });
  }

  deleteUser(user: AdminUser): void {
    if (!confirm(`Are you sure you want to DELETE user "${user.username}"? This action cannot be undone!`)) {
      return;
    }

    this.adminService.deleteUser(user.id).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== user.id);
        alert(`User "${user.username}" has been deleted`);
      },
      error: (error) => {
        console.error('Failed to delete user:', error);
        alert('Failed to delete user');
      }
    });
  }

  // Posts Methods
  loadPosts(): void {
    this.loading = true;
    this.adminService.getAllPosts().subscribe({
      next: (posts) => {
        this.posts = posts;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load posts:', error);
        this.loading = false;
        alert('Failed to load posts');
      }
    });
  }

  hidePost(post: AdminPost): void {
    this.adminService.hidePost(post.id).subscribe({
      next: () => {
        post.isHidden = true;
        alert('Post has been hidden');
      },
      error: (error) => {
        console.error('Failed to hide post:', error);
        alert('Failed to hide post');
      }
    });
  }

  unhidePost(post: AdminPost): void {
    this.adminService.unhidePost(post.id).subscribe({
      next: () => {
        post.isHidden = false;
        alert('Post has been unhidden');
      },
      error: (error) => {
        console.error('Failed to unhide post:', error);
        alert('Failed to unhide post');
      }
    });
  }

  deletePost(post: AdminPost): void {
    if (!confirm(`Are you sure you want to DELETE this post? This action cannot be undone!`)) {
      return;
    }

    this.adminService.deletePost(post.id).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p.id !== post.id);
        alert('Post has been deleted');
      },
      error: (error) => {
        console.error('Failed to delete post:', error);
        alert('Failed to delete post');
      }
    });
  }

  // Reports Methods
  loadReports(): void {
    this.loading = true;
    this.adminService.getAllReports().subscribe({
      next: (reports) => {
        this.reports = reports;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load reports:', error);
        this.loading = false;
        alert('Failed to load reports');
      }
    });
  }

  updateReportStatus(report: AdminReport, status: string): void {
    this.adminService.updateReportStatus(report.id, status).subscribe({
      next: () => {
        report.status = status;
        alert(`Report status updated to ${status}`);
      },
      error: (error) => {
        console.error('Failed to update report status:', error);
        alert('Failed to update report status');
      }
    });
  }

  deleteReport(report: AdminReport): void {
    if (!confirm('Are you sure you want to delete this report?')) {
      return;
    }

    this.adminService.deleteReport(report.id).subscribe({
      next: () => {
        this.reports = this.reports.filter(r => r.id !== report.id);
        alert('Report has been deleted');
      },
      error: (error) => {
        console.error('Failed to delete report:', error);
        alert('Failed to delete report');
      }
    });
  }

  getReportType(report: AdminReport): string {
    return report.postId ? 'Post Report' : 'User Report';
  }

  getReportedEntity(report: AdminReport): string {
    if (report.postId) {
      return `Post: ${report.postTitle || '#' + report.postId}`;
    }
    return `User: ${report.reportedUsername || 'Unknown'}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
