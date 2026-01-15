import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface AuthResponse {
  id?: number;
  token: string;
  type: string;
  username: string;
  email: string;
  role: string; 
}

export interface Post {
  id: number;
  title: string;
  description: string;  
  mediaUrl: string;
  createdAt: string;
  username: string;
  userId?: number;  // Made optional since backend might not always return it
  likeCount: number;
  isLiked: boolean;
  commentCount: number;
  // UI-specific properties for comments
  showComments?: boolean;
  comments?: Comment[];
  newComment?: string;
  loadingComments?: boolean;
}

export interface Comment {
  id: number;
  content: string;
  username: string;
  createdAt: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  subscriberCount?: number;
  isSubscribed?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, request);
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, request);
  }

  getSubscribedUsersposts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.baseUrl}/user/me`);
  }

  // Get all users
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/user/all`);
  }

  // Create a new post
  createPost(formData: FormData): Observable<Post> {
    return this.http.post<Post>(`${this.baseUrl}/posts`, formData);
  }

  // Delete a post
  deletePost(postId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/posts/${postId}`);
  }

  // Update a post
  editPost(postId: number, formData: FormData): Observable<Post> {
    return this.http.put<Post>(`${this.baseUrl}/posts/${postId}`, formData);
  }

  // Get posts by username for user profile
  getUserPosts(username: string): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.baseUrl}/posts/user/${username}`);
  }

  // Like a post
  likePost(postId: number): Observable<{ likeCount: number; isLiked: boolean }> {
    return this.http.post<{ likeCount: number; isLiked: boolean }>(
      `${this.baseUrl}/posts/${postId}/like`, {}
    );
  }

  // Unlike a post
  unlikePost(postId: number): Observable<{ likeCount: number; isLiked: boolean }> {
    return this.http.delete<{ likeCount: number; isLiked: boolean }>(
      `${this.baseUrl}/posts/${postId}/like`
    );
  }

  // Get comments for a post
  getComments(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.baseUrl}/posts/${postId}/comments`);
  }

  // Add a comment to a post
  addComment(postId: number, content: string): Observable<Comment & { commentCount: number }> {
    return this.http.post<Comment & { commentCount: number }>(
      `${this.baseUrl}/posts/${postId}/comments`,
      { content }
    );
  }

  // Delete a comment
  deleteComment(postId: number, commentId: number): Observable<{ message: string; commentCount: number }> {
    return this.http.delete<{ message: string; commentCount: number }>(
      `${this.baseUrl}/posts/${postId}/comments/${commentId}`
    );
  }

  // Subscription methods
  
  // Subscribe to a user
  subscribe(username: string): Observable<{ message: string; isSubscribed: boolean; subscriberCount: number }> {
    return this.http.post<{ message: string; isSubscribed: boolean; subscriberCount: number }>(
      `${this.baseUrl}/subscriptions/subscribe/${username}`, {}
    );
  }

  // Unsubscribe from a user
  unsubscribe(username: string): Observable<{ message: string; isSubscribed: boolean; subscriberCount: number }> {
    return this.http.delete<{ message: string; isSubscribed: boolean; subscriberCount: number }>(
      `${this.baseUrl}/subscriptions/unsubscribe/${username}`
    );
  }

  // Check subscription status
  checkSubscription(username: string): Observable<{ isSubscribed: boolean; subscriberCount: number }> {
    return this.http.get<{ isSubscribed: boolean; subscriberCount: number }>(
      `${this.baseUrl}/subscriptions/check/${username}`
    );
  }

  // Get user's subscribers
  getSubscribers(username: string): Observable<{ username: string; email: string }[]> {
    return this.http.get<{ username: string; email: string }[]>(
      `${this.baseUrl}/subscriptions/${username}/subscribers`
    );
  }

  // Get users that a user is subscribed to
  getSubscriptions(username: string): Observable<{ username: string; email: string }[]> {
    return this.http.get<{ username: string; email: string }[]>(
      `${this.baseUrl}/subscriptions/${username}/subscriptions`
    );
  }

  // Report a post or user
  reportPost(reportData: { postId: number; reportType: 'post' | 'user'; reason: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/reports`, reportData);
  }
}