import { Component, HostListener, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../services/api.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements AfterViewInit {
  loginData: LoginRequest = { usernameOrEmail: '', password: '' };
  loading = false;
  error = '';

  private lookAway = false;
  private eyes: HTMLElement[] = [];
  private mouth: HTMLElement | null = null;
  private face: HTMLElement | null = null;

  constructor(private authService: AuthService, private router: Router) {}

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
    if (!this.loginData.usernameOrEmail || !this.loginData.password) {
      this.error = 'Please fill in all fields';
      return;
    }

    this.loading = true;
    this.authService.login(this.loginData).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Login failed. Please try again.';
      }
    });
  }
}
