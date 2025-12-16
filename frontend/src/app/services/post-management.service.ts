import { Injectable } from '@angular/core';
import { Post, Comment } from './api.service';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class PostManagementService {
  constructor(private apiService: ApiService) {}

  /**
   * Toggle like on a post
   */
  toggleLike(post: Post): void {
    if (post.isLiked) {
      this.apiService.unlikePost(post.id).subscribe({
        next: (response) => {
          post.likeCount = response.likeCount;
          post.isLiked = response.isLiked;
        },
        error: (error) => {
          console.error('Failed to unlike post:', error);
        }
      });
    } else {
      this.apiService.likePost(post.id).subscribe({
        next: (response) => {
          post.likeCount = response.likeCount;
          post.isLiked = response.isLiked;
        },
        error: (error) => {
          console.error('Failed to like post:', error);
        }
      });
    }
  }

  /**
   * Toggle comments visibility
   */
  toggleComments(post: Post): void {
    post.showComments = !post.showComments;
    
    // Load comments if opening and not already loaded
    if (post.showComments && !post.comments) {
      post.loadingComments = true;
      this.apiService.getComments(post.id).subscribe({
        next: (comments) => {
          post.comments = comments;
          post.loadingComments = false;
        },
        error: (error) => {
          console.error('Failed to load comments:', error);
          post.loadingComments = false;
        }
      });
    }
  }

  /**
   * Add a comment to a post
   */
  addComment(post: Post): void {
    if (!post.newComment || post.newComment.trim() === '') {
      return;
    }

    this.apiService.addComment(post.id, post.newComment.trim()).subscribe({
      next: (comment) => {
        if (!post.comments) {
          post.comments = [];
        }
        post.comments.unshift(comment);
        post.commentCount = comment.commentCount;
        post.newComment = '';
      },
      error: (error) => {
        console.error('Failed to add comment:', error);
        alert('Failed to add comment');
      }
    });
  }

  /**
   * Delete a comment from a post
   */
  deleteComment(post: Post, comment: Comment): void {
    this.apiService.deleteComment(post.id, comment.id).subscribe({
      next: (response) => {
        if (post.comments) {
          post.comments = post.comments.filter((c: Comment) => c.id !== comment.id);
        }
        post.commentCount = response.commentCount;
      },
      error: (error) => {
        console.error('Failed to delete comment:', error);
        alert('Failed to delete comment');
      }
    });
  }

  /**
   * Utility: Check if media URL is an image
   */
  isImage(mediaUrl: string): boolean {
    if (!mediaUrl) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return imageExtensions.some(ext => mediaUrl.toLowerCase().endsWith(ext));
  }

  /**
   * Utility: Check if media URL is a video
   */
  isVideo(mediaUrl: string): boolean {
    if (!mediaUrl) return false;
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
    return videoExtensions.some(ext => mediaUrl.toLowerCase().endsWith(ext));
  }
}
