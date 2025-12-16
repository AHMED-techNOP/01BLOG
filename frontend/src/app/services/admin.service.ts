import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  postCount: number;
  followerCount: number;
  isBanned?: boolean;
}

export interface AdminPost {
  id: number;
  title: string;
  content: string;
  username: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  isHidden?: boolean;
}

export interface AdminReport {
  id: number;
  reporterId: number;
  reporterUsername: string;
  reportedUserId?: number;
  reportedUsername?: string;
  postId?: number;
  postTitle?: string;
  reason: string;
  status: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  // Users
  getAllUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.apiUrl}/users`);
  }

  banUser(userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${userId}/ban`, {});
  }

  unbanUser(userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${userId}/unban`, {});
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${userId}`);
  }

  // Posts
  getAllPosts(): Observable<AdminPost[]> {
    return this.http.get<AdminPost[]>(`${this.apiUrl}/posts`);
  }

  hidePost(postId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/posts/${postId}/hide`, {});
  }

  unhidePost(postId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/posts/${postId}/unhide`, {});
  }

  deletePost(postId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/posts/${postId}`);
  }

  // Reports
  getAllReports(): Observable<AdminReport[]> {
    return this.http.get<AdminReport[]>(`${this.apiUrl}/reports`);
  }

  updateReportStatus(reportId: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/reports/${reportId}/status`, { status });
  }

  deleteReport(reportId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reports/${reportId}`);
  }
}
