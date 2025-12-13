import { Component, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Post } from '../../../services/api.service';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-create-post',
  imports: [
    CommonModule, 
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './create-post.component-material.html',
  styleUrl: './create-post.component.css'
})
export class CreatePostComponent implements OnChanges {
  @Input() editingPost: Post | null = null;
  @Output() cancel = new EventEmitter<void>();
  @Output() postCreated = new EventEmitter<any>();
  @Output() postUpdated = new EventEmitter<any>();

  title: string = '';
  content: string = '';
  mediaFile: File | null = null;
  mediaPreview: string | null = null;
  mediaType: 'image' | 'video' | null = null;
  loading: boolean = false;
  error: string = '';
  removeExistingMedia: boolean = false;

  // Max file size: 10MB for images, 50MB for videos
  private readonly MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

  constructor(private apiService: ApiService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editingPost'] && this.editingPost) {
      // Populate form with existing post data
      this.title = this.editingPost.title;
      this.content = this.editingPost.description;
      
      // Set media preview if exists
      if (this.editingPost.mediaUrl) {
        this.mediaPreview = 'http://localhost:8080' + this.editingPost.mediaUrl;
        this.mediaType = this.isImage(this.editingPost.mediaUrl) ? 'image' : 'video';
      }
    }
  }

  isImage(url: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Determine media type
      if (file.type.startsWith('image/')) {
        this.mediaType = 'image';
        // Check image size
        if (file.size > this.MAX_IMAGE_SIZE) {
          this.error = 'Image size must be less than 10MB';
          event.target.value = ''; // Reset file input
          return;
        }
      } else if (file.type.startsWith('video/')) {
        this.mediaType = 'video';
        // Check video size
        if (file.size > this.MAX_VIDEO_SIZE) {
          this.error = 'Video size must be less than 50MB';
          event.target.value = ''; // Reset file input
          return;
        }
      } else {
        this.error = 'Please select an image or video file';
        event.target.value = ''; // Reset file input
        return;
      }

      this.mediaFile = file;
      this.error = ''; // Clear any previous errors

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.mediaPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeMedia(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    
    this.mediaFile = null;
    this.mediaPreview = null;
    this.mediaType = null;
    
    // If editing and removing existing media, set flag
    if (this.editingPost) {
      this.removeExistingMedia = true;
    }
  }

  onSubmit(): void {
    this.error = '';
    
    if (!this.title.trim()) {
      this.error = 'Title is required';
      return;
    }

    if (!this.content.trim()) {
      this.error = 'Content is required';
      return;
    }

    this.loading = true;

    // Create FormData to send multipart/form-data request
    const formData = new FormData();
    formData.append('title', this.title.trim());
    formData.append('description', this.content.trim());
    
    // Add media file if present
    if (this.mediaFile) {
      formData.append('media', this.mediaFile);
    }
    
    // If editing and removing media
    if (this.editingPost && this.removeExistingMedia) {
      formData.append('removeMedia', 'true');
    }

    // Determine if we're creating or updating
    if (this.editingPost) {
      // Update existing post
      this.apiService.editPost(this.editingPost.id, formData).subscribe({
        next: (response) => {
          console.log('Post updated successfully:', response);
          this.loading = false;
          this.postUpdated.emit(response);
          this.resetForm();
          this.cancel.emit();
        },
        error: (error) => {
          console.error('Failed to update post:', error);
          this.loading = false;
          this.error = error.error?.message || 'Failed to update post. Please try again.';
        }
      });
    } else {
      // Create new post
      this.apiService.createPost(formData).subscribe({
        next: (response) => {
          console.log('Post created successfully:', response);
          this.loading = false;
          this.postCreated.emit(response);
          this.resetForm();
          this.cancel.emit();
        },
        error: (error) => {
          console.error('Failed to create post:', error);
          this.loading = false;
          this.error = error.error?.message || 'Failed to create post. Please try again.';
        }
      });
    }
  }

  resetForm(): void {
    this.title = '';
    this.content = '';
    this.mediaFile = null;
    this.mediaPreview = null;
    this.mediaType = null;
    this.error = '';
    this.removeExistingMedia = false;
  }

  onCancel(): void {
    this.resetForm();
    this.cancel.emit();
  }
}
