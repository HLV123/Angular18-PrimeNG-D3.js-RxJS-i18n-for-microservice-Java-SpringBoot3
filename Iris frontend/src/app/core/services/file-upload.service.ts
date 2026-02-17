import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
}

@Injectable({ providedIn: 'root' })
export class FileUploadService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  upload(entityType: string, entityId: string, file: File): Observable<HttpEvent<UploadedFile>> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<UploadedFile>(
      `${this.baseUrl}/${entityType}/${entityId}/documents`,
      formData, { reportProgress: true, observe: 'events' }
    );
  }

  getFiles(entityType: string, entityId: string): Observable<UploadedFile[]> {
    return this.http.get<UploadedFile[]>(`${this.baseUrl}/${entityType}/${entityId}/documents`);
  }

  deleteFile(entityType: string, entityId: string, fileId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${entityType}/${entityId}/documents/${fileId}`);
  }

  download(entityType: string, entityId: string, fileId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${entityType}/${entityId}/documents/${fileId}/download`, { responseType: 'blob' });
  }
}