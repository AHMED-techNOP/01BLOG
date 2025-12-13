import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/shared/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <!-- Video Background -->
    <div class="video-background">
      <video #bgVideo 
             muted 
             loop 
             playsinline 
             class="background-video"
             preload="auto">
        <source src="http://localhost:8080/uploads/6170f1c4-7fd4-4e10-b567-d45833477cd2.mp4" type="video/mp4">
        Your browser does not support the video tag.
      </video>
      <div class="video-overlay"></div>
    </div>
    
    <!-- App Content -->
    <div class="app-content">
      <app-header></app-header>
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: relative;
      width: 100%;
      height: 100%;
    }

    .video-background {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: -2;
      overflow: hidden;
      background: #000;
    }

    .background-video {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }

    .video-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1;
      pointer-events: none;
    }

    .app-content {
      position: relative;
      z-index: 1;
      width: 100%;
      min-height: 100vh;
      zoom: 0.9;
      -moz-transform: scale(0.9);
      -moz-transform-origin: 0 0;
    }

    /* Ensure video plays on iOS */
    @media (max-width: 768px) {
      .background-video {
        width: 100%;
        height: 100%;
      }
    }
  `]
})
export class AppComponent implements AfterViewInit {
  title = '01Blog';
  
  @ViewChild('bgVideo') videoElement!: ElementRef<HTMLVideoElement>;

  ngAfterViewInit(): void {
    // Wait a bit for the view to fully initialize
    setTimeout(() => {
      this.playVideo();
    }, 100);
  }

  playVideo(): void {
    const video = this.videoElement?.nativeElement;
    if (video) {
      console.log('Attempting to play video...');
      video.muted = true; // Ensure it's muted
      
      const playPromise = video.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Video playing successfully!');
          })
          .catch(error => {
            console.error('Video play failed:', error);
            // Fallback: Try to play on user interaction
            this.addPlayOnClickListener(video);
          });
      }
    }
  }

  addPlayOnClickListener(video: HTMLVideoElement): void {
    const playOnClick = () => {
      video.play()
        .then(() => console.log('Video started on user click'))
        .catch(err => console.error('Still failed:', err));
      document.removeEventListener('click', playOnClick);
    };
    document.addEventListener('click', playOnClick, { once: true });
  }
}
