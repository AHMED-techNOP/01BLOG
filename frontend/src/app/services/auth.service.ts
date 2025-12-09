import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService, RegisterRequest, LoginRequest, AuthResponse } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private apiService: ApiService, private router: Router) {
    // Check if user is already logged in on service initialization
    const storedToken = localStorage.getItem('jwt_token');
    if (storedToken) {
      try {
        // Extract user data from stored JWT token (for display purposes only)
        // Backend will validate the token when making API calls
        const userData = this.extractUserFromToken(storedToken);
        this.currentUserSubject.next(userData);
      } catch (error) {
        // Token format is invalid, clear it
        localStorage.removeItem('jwt_token');
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
      }
    }
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.apiService.register(request).pipe(
      tap(response => {
        this.setCurrentUser(response);
      })
    );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.apiService.login(request).pipe(
      tap(response => {
        this.setCurrentUser(response);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('jwt_token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  private setCurrentUser(user: AuthResponse): void {
    // Store only the JWT token
    localStorage.setItem('jwt_token', user.token);
    // But keep the full user object in memory for performance
    this.currentUserSubject.next(user);
  }

  get currentUserValue(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  get token(): string | null {
    return this.currentUserValue?.token || null;
  }

  get username(): string | null {
    return this.currentUserValue?.username || null;
  }

  get email(): string | null {
    return this.currentUserValue?.email || null;
  }

  get role(): string {
    return this.currentUserValue?.role || '';
  }

  hasRole(role: string): boolean {
    return this.role === role;
  }

  isAdmin(): boolean {
    return this.hasRole('ROLE_ADMIN') || this.hasRole('ADMIN');
  }

  // Get user info from token (avoid extra API calls)
  getUserInfo(): any {
    return this.currentUserValue;
  }

  // Extract user data from JWT token
  private extractUserFromToken(token: string): AuthResponse {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        token: token,
        type: 'Bearer',
        username: payload.sub || payload.username,
        email: payload.email,
        role: payload.role || payload.authorities?.[0] || 'USER'
      };
    } catch (error) {
      throw new Error('Invalid token format');
    }
  }
}
