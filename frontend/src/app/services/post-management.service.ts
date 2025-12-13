import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Post, Comment } from './api.service';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class PostManagementService {
  // Observable for post updates
  private postUpdatedSubject = new Subject<Post>();
  public postUpdated$ = this.postUpdatedSubject.asObservable();

  private postDeletedSubject = new Subject<number>();
  public postDeleted$ = this.postDeletedSubject.asObservable();

  // New post creation (from header/create modal)
  private newPostSubject = new Subject<Post>();
  public newPost$ = this.newPostSubject.asObservable();

  // Refresh posts trigger
  private refreshPostsSubject = new Subject<void>();
  public refreshPosts$ = this.refreshPostsSubject.asObservable();

  // Edit modal state
  private editModalSubject = new Subject<{ post: Post | null; show: boolean }>();
  public editModal$ = this.editModalSubject.asObservable();

  constructor(private apiService: ApiService) {}

  /**
   * Open edit modal for a post
   */
  openEditModal(post: Post): void {
    this.editModalSubject.next({ post, show: true });
  }

  /**
   * Close edit modal
   */
  closeEditModal(): void {
    this.editModalSubject.next({ post: null, show: false });
  }

  /**
   * Handle post update
   */
  handlePostUpdate(updatedPost: Post, posts: Post[]): Post[] {
    const index = posts.findIndex(p => p.id === updatedPost.id);
    if (index !== -1) {
      posts[index] = updatedPost;
    }
    this.postUpdatedSubject.next(updatedPost);
    this.closeEditModal();
    return [...posts]; // Return new array for change detection
  }

  /**
   * Handle post creation
   */
  handlePostCreation(newPost: Post, posts: Post[]): Post[] {
    const updatedPosts = [newPost, ...posts];
    this.closeEditModal();
    return updatedPosts;
  }

  /**
   * Delete a post with confirmation
   */
  deletePost(postId: number, posts: Post[]): Promise<Post[]> {
    return new Promise((resolve, reject) => {
        this.apiService.deletePost(postId).subscribe({
          next: () => {
            const updatedPosts = posts.filter(p => p.id !== postId);
            this.postDeletedSubject.next(postId);
            resolve(updatedPosts);
          },
          error: (error) => {
            console.error('Failed to delete post:', error);
            alert('Failed to delete post. Please try again.');
            reject(error);
          }
        });
    });
  }

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

  /**
   * Add a new post (from header or create modal)
   * This broadcasts to all components listening to newPost$
   */
  addNewPost(post: Post): void {
    this.newPostSubject.next(post);
  }

  /**
   * Trigger a refresh of posts across all components
   */
  triggerRefresh(): void {
    this.refreshPostsSubject.next();
  }
}
