import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './error.component.html',
  styleUrl: './error.component.css'
})
export class ErrorComponent implements OnInit {
  errorCode: number = 500;
  errorTitle: string = 'Something Went Wrong';
  errorMessage: string = 'An unexpected error occurred. Please try again.';
  errorIcon: string = 'error';

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Check query params first (from interceptor redirects)
    this.route.queryParams.subscribe(params => {
      if (params['code']) {
        this.errorCode = parseInt(params['code']);
        this.setErrorDetails(this.errorCode);
      }
      if (params['message']) {
        this.errorMessage = params['message'];
      }
    });

    // Check route data (from catch-all route)
    this.route.data.subscribe(data => {
      if (data['code'] && !this.route.snapshot.queryParams['code']) {
        this.errorCode = data['code'];
        this.setErrorDetails(this.errorCode);
      }
    });
  }

  setErrorDetails(code: number): void {
    switch (code) {
      case 403:
        this.errorTitle = 'Access Forbidden';
        this.errorMessage = "You don't have permission to access this resource.";
        this.errorIcon = 'block';
        break;
      case 404:
        this.errorTitle = 'Page Not Found';
        this.errorMessage = "The page you're looking for doesn't exist or has been moved.";
        this.errorIcon = 'warning';
        break;
      case 500:
        this.errorTitle = 'Server Error';
        this.errorMessage = 'Something went wrong on our end. Please try again later.';
        this.errorIcon = 'error';
        break;
      case 503:
        this.errorTitle = 'Service Unavailable';
        this.errorMessage = 'The service is temporarily unavailable. Please try again later.';
        this.errorIcon = 'cloud_off';
        break;
      default:
        this.errorTitle = 'Something Went Wrong';
        this.errorMessage = 'An unexpected error occurred. Please try again.';
        this.errorIcon = 'error';
    }
  }

  goHome(): void {
    this.router.navigate(['/dashboard']);
  }

  goBack(): void {
    window.history.back();
  }

  retry(): void {
    window.location.reload();
  }
}
