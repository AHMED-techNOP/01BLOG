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
  token: string;
  type: string;
  username: string;
  email: string;
  role: string; 
}

export interface Post {
  id: number;
  title: string;
  description: string;  // Changed from 'content' to 'description'
  mediaUrl: string;
  createdAt: string;
  username: string;
  userId?: number;  // Made optional since backend might not always return it
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  // Authentication endpoints
  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, request);
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, request);
  }

  getSubscribedUsersposts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.baseUrl}/user/me`);
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
}