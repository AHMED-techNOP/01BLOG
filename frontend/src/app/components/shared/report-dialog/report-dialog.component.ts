import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../../services/api.service';

export interface ReportDialogData {
  postId: number;
  postUsername: string;
  postTitle: string;
}

@Component({
  selector: 'app-report-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './report-dialog.component.html',
  styleUrl: './report-dialog.component.css'
})
export class ReportDialogComponent {
  reason: string = '';
  customReason: string = '';
  loading: boolean = false;
  errorMessage: string = '';

  reportReasons = [
    'Spam or misleading',
    'Harassment or hate speech',
    'Violence or threats',
    'Inappropriate content',
    'Copyright violation',
    'False information',
    'Other'
  ];

  constructor(
    public dialogRef: MatDialogRef<ReportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ReportDialogData,
    private apiService: ApiService
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    // Clear previous error
    this.errorMessage = '';

    if (!this.reason) {
      this.errorMessage = 'Please select a reason for reporting';
      return;
    }

    if (this.reason === 'Other' && !this.customReason.trim()) {
      this.errorMessage = 'Please provide a reason for reporting';
      return;
    }

    this.loading = true;

    const reportData = {
      postId: this.data.postId,
      reason: this.reason === 'Other' ? this.customReason.trim() : this.reason
    };

    this.apiService.reportPost(reportData).subscribe({
      next: (response) => {
        console.log('Report submitted successfully:', response);
        this.loading = false;
        this.dialogRef.close(reportData);
      },
      error: (error) => {
        console.error('Failed to submit report:', error);
        this.loading = false;
        this.errorMessage = 'Failed to submit report. Please try again.';
      }
    });
  }
}
