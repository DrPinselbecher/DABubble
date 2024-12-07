import { CommonModule } from '@angular/common';
import { Component, inject, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-file-view-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './file-view-dialog.component.html',
  styleUrls: ['./file-view-dialog.component.scss']
})
export class FileViewDialogComponent {

  data = inject(MAT_DIALOG_DATA);
  safePdfUrl: SafeResourceUrl | null = null;
  
  constructor( public dialogRef: MatDialogRef<FileViewDialogComponent>, private sanitizer: DomSanitizer) {
    this.initializeSafeUrl();
  }

  /**
   * Closes the dialog.
   */
  closeDialog() {
    this.dialogRef.close();
  }

/**
 * Initializes the safeUrl for the PDF file to be displayed in the iframe.
 * If the file type is not 'application/pdf', the safeUrl will be null.
 */
  initializeSafeUrl() {
    if (this.data.file.type === 'application/pdf') {
      this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.data.file.data);
    }
  }
}


