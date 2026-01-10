import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // Add JWT token to requests if available (except for auth endpoints)
    const token = this.authService.token;
    
    // Don't add token to login/register endpoints
    const isAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('/auth/register');
    
    if (token && !isAuthEndpoint) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 401 Unauthorized (token expired/invalid) - logout user
        if (error.status === 401 && !isAuthEndpoint) {
          console.log('Token expired or invalid (401), logging out...');
          this.authService.logout();
          // Redirect will be handled by AuthService.logout()
        }
        // Handle 403 Forbidden (permission denied) - show error page but don't logout
        else if (error.status === 403 && !isAuthEndpoint) {
          console.error('Access forbidden (403): You don\'t have permission for this action');
          this.router.navigate(['/error'], { queryParams: { code: 403 } });
        }
        // Handle 404 Not Found - show error page
        else if (error.status === 404 && !isAuthEndpoint) {
          console.error('Resource not found (404):', error.message);
          this.router.navigate(['/error'], { queryParams: { code: 404 } });
        }
        // Handle 500 Server Error - show error page
        else if (error.status === 500 && !isAuthEndpoint) {
          console.error('Server error (500):', error.message);
          this.router.navigate(['/error'], { queryParams: { code: 500 } });
        }
        return throwError(() => error);
      })
    );
  }
}
