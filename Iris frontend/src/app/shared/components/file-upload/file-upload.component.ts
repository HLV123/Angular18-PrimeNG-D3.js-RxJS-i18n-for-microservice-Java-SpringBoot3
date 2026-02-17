import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="upload-zone" [class.drag-over]="isDragOver"
         (dragover)="onDragOver($event)" (dragleave)="isDragOver=false"
         (drop)="onDrop($event)" (click)="fileInput.click()">
      <input #fileInput type="file" [accept]="accept" [multiple]="multiple" (change)="onFileSelect($event)" hidden />
      <i class="pi pi-cloud-upload" style="font-size:32px;color:#94a3b8;"></i>
      <p class="upload-text">Drag & drop files here or <span class="link">browse</span></p>
      <p class="upload-hint">{{ accept || 'All file types' }} · Max {{ maxSizeMB }}MB</p>
    </div>
    @if (files.length > 0) {
      <div class="file-list">
        @for (f of files; track $index) {
          <div class="file-item">
            <i class="pi pi-file"></i>
            <span class="file-name">{{ f.name }}</span>
            <span class="file-size">{{ (f.size / 1024).toFixed(1) }}KB</span>
            <button class="remove-btn" (click)="removeFile($index)"><i class="pi pi-times"></i></button>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .upload-zone { border: 2px dashed #e2e8f0; border-radius: 12px; padding: 32px; text-align: center; cursor: pointer; transition: all 0.2s; background: #fafafa; }
    .upload-zone:hover, .upload-zone.drag-over { border-color: #2563eb; background: #eff6ff; }
    .upload-text { font-size: 14px; color: #64748b; margin: 8px 0 4px; } .link { color: #2563eb; font-weight: 600; }
    .upload-hint { font-size: 12px; color: #94a3b8; margin: 0; }
    .file-list { margin-top: 12px; display: flex; flex-direction: column; gap: 6px; }
    .file-item { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13px; }
    .file-name { flex: 1; font-weight: 500; color: #334155; overflow: hidden; text-overflow: ellipsis; }
    .file-size { color: #94a3b8; font-size: 12px; }
    .remove-btn { background: none; border: none; cursor: pointer; color: #ef4444; padding: 2px; }
  `]
})
export class FileUploadComponent {
  @Input() accept = '';
  @Input() multiple = true;
  @Input() maxSizeMB = 10;
  @Output() filesChanged = new EventEmitter<File[]>();

  files: File[] = [];
  isDragOver = false;

  onDragOver(e: DragEvent) { e.preventDefault(); this.isDragOver = true; }
  onDrop(e: DragEvent) {
    e.preventDefault(); this.isDragOver = false;
    if (e.dataTransfer?.files) this.addFiles(Array.from(e.dataTransfer.files));
  }
  onFileSelect(e: any) { if (e.target.files) this.addFiles(Array.from(e.target.files)); }
  addFiles(newFiles: File[]) {
    const valid = newFiles.filter(f => f.size <= this.maxSizeMB * 1024 * 1024);
    this.files = this.multiple ? [...this.files, ...valid] : valid.slice(0, 1);
    this.filesChanged.emit(this.files);
  }
  removeFile(i: number) { this.files.splice(i, 1); this.filesChanged.emit(this.files); }
}