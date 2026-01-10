import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';



@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiresAdmin = route.data['requiresAdmin'] || false;

    // Check if user has token and user data
    if (!this.authService.isLoggedIn) {
      this.router.navigate(['/login']);
      return false;
    }

    // Check admin role if required
    if (requiresAdmin && !this.authService.isAdmin()) {
      this.router.navigate(['/error'], { queryParams: { code: 403, message: 'Admin access required' } });
      return false;
    }

    // Allow navigation - token will be validated by Spring Security on actual API calls
    // If invalid, backend returns 401 and HTTP interceptor logs user out automatically
    return true;
  }
}

/**
 * GuestGuard - Protects routes that should only be accessible to non-authenticated users
 * Redirects to /dashboard if user is already logged in
 */
@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    // If user is already logged in, redirect to dashboard
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    // If not logged in, allow access to login/register
    return true;
  }
}
