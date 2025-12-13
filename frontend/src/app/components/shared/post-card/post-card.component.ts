import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Post, Comment } from '../../../services/api.service';
import { ReportDialogComponent } from '../report-dialog/report-dialog.component';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './post-card.component.html',
  styleUrl: './post-card.component.css'
})
export class PostCardComponent {
  @Input() post!: Post;
  @Input() currentUser: any;
  @Input() showMenu: boolean = true; // Option to hide edit/delete menu

  @Output() likeToggled = new EventEmitter<Post>();
  @Output() commentsToggled = new EventEmitter<Post>();
  @Output() commentAdded = new EventEmitter<Post>();
  @Output() commentDeleted = new EventEmitter<{ post: Post, comment: Comment }>();
  @Output() postEdited = new EventEmitter<Post>();
  @Output() postDeleted = new EventEmitter<number>();
  @Output() usernameClicked = new EventEmitter<string>();

  constructor(
    private router: Router,
    private dialog: MatDialog
  ) {}

  isCurrentUserPost(): boolean {
    return this.currentUser && this.post.username === this.currentUser.username;
  }

  isCurrentUserComment(comment: Comment): boolean {
    return this.currentUser && comment.username === this.currentUser.username;
  }

  isImage(mediaUrl: string): boolean {
    if (!mediaUrl) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return imageExtensions.some(ext => mediaUrl.toLowerCase().endsWith(ext));
  }

  isVideo(mediaUrl: string): boolean {
    if (!mediaUrl) return false;
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
    return videoExtensions.some(ext => mediaUrl.toLowerCase().endsWith(ext));
  }

  onLikeToggle(event: Event): void {
    event.stopPropagation();
    this.likeToggled.emit(this.post);
  }

  onCommentsToggle(event: Event): void {
    event.stopPropagation();
    this.commentsToggled.emit(this.post);
  }

  onAddComment(): void {
    this.commentAdded.emit(this.post);
  }

  onDeleteComment(comment: Comment): void {
    this.commentDeleted.emit({ post: this.post, comment });
  }

  onEditPost(): void {
    this.postEdited.emit(this.post);
  }

  onDeletePost(): void {
    this.postDeleted.emit(this.post.id);
  }

  onReportPost(): void {
    const dialogRef = this.dialog.open(ReportDialogComponent, {
      width: '500px',
      data: {
        postId: this.post.id,
        postUsername: this.post.username,
        postTitle: this.post.title
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Post reported:', result);
      }
    });
  }

  onUsernameClick(username: string, event: Event): void {
    event.stopPropagation();
    this.usernameClicked.emit(username);
  }
}
