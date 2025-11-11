import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

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
        // Handle 401 Unauthorized or 403 Forbidden (token expired/invalid)
        if (error.status === 401 || error.status === 403) {
          this.authService.logout();
        }
        return throwError(() => error);
      })
    );
  }
}
