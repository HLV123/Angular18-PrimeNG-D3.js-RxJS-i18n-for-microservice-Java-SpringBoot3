import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loadingService.isLoading()) {
      <div class="loading-overlay">
        <div class="spinner">
          <div class="ring"></div>
          <span>Loading...</span>
        </div>
      </div>
    }
  `,
  styles: [`
    .loading-overlay { position: fixed; inset: 0; background: rgba(255,255,255,0.8); z-index: 9999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); }
    .spinner { text-align: center; }
    .ring { width: 48px; height: 48px; border: 4px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 12px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    span { font-size: 14px; color: #64748b; font-weight: 500; }
  `]
})
export class LoadingComponent {
  constructor(public loadingService: LoadingService) {}
}