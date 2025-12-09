import { Component, HostListener, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../services/api.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements AfterViewInit {
  registerData: RegisterRequest = {
    username: '',
    email: '',
    password: ''
  };
  
  confirmPassword = '';
  loading = false;
  error = '';
  success = '';

  private lookAway = false;
  private eyes: HTMLElement[] = [];
  private mouth: HTMLElement | null = null;
  private face: HTMLElement | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngAfterViewInit() {
    const left = document.getElementById('eye-left')!;
    const right = document.getElementById('eye-right')!;
    this.eyes = [left, right];
    this.mouth = document.getElementById('mouth');
    this.face = document.querySelector('.scary-face');
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.lookAway) return;

    this.eyes.forEach(eye => {
      const pupil = eye.querySelector('.pupil') as HTMLElement;
      const rect = eye.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = event.clientX - centerX;
      const dy = event.clientY - centerY;
      const max = 18;
      const distX = Math.max(-max, Math.min(max, dx / 10));
      const distY = Math.max(-max, Math.min(max, dy / 10));
      pupil.style.transform = `translate(${distX}px, ${distY}px)`;
    });
  }

  onPasswordFocus() {
    this.lookAway = true;
    this.eyes.forEach(eye => {
      const pupil = eye.querySelector('.pupil') as HTMLElement;
      pupil.style.transform = 'translateX(-27px)'; // look left
    });
    if (this.mouth) this.mouth.classList.add('smile');
    if (this.face) this.face.classList.add('menacing');
  }

  onPasswordBlur() {
    this.lookAway = false;
    this.eyes.forEach(eye => {
      const pupil = eye.querySelector('.pupil') as HTMLElement;
      pupil.style.transform = 'translate(0px, 0px)';
    });
    if (this.mouth) this.mouth.classList.remove('smile');
    if (this.face) this.face.classList.remove('menacing');
  }

  onSubmit(): void {
    this.error = '';
    this.success = '';

    // Validation
    if (!this.registerData.username || !this.registerData.email || !this.registerData.password) {
      this.error = 'All fields are required';
      return;
    }

    if (this.registerData.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    if (this.registerData.password.length < 6) {
      this.error = 'Password must be at least 6 characters';
      return;
    }

    this.loading = true;

    this.authService.register(this.registerData).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Registration successful! Redirecting...';
          this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        console.error('Registration error:', err);
        this.error = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}
