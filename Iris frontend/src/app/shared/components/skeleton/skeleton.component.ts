import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-container">
      @if (type === 'table') {
        <div class="sk-row header"></div>
        @for (i of rows; track $index) { <div class="sk-row"></div> }
      }
      @if (type === 'cards') {
        <div class="sk-cards">@for (i of rows; track $index) { <div class="sk-card"></div> }</div>
      }
      @if (type === 'detail') {
        <div class="sk-detail-header"></div>
        <div class="sk-detail-grid">@for (i of [1,2,3,4,5,6]; track $index) { <div class="sk-field"></div> }</div>
      }
    </div>
  `,
  styles: [`
    .skeleton-container { animation: pulse 1.5s infinite; }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
    .sk-row { height: 44px; background: #f1f5f9; border-radius: 8px; margin-bottom: 6px; }
    .sk-row.header { background: #e2e8f0; height: 36px; }
    .sk-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .sk-card { height: 100px; background: #f1f5f9; border-radius: 12px; }
    .sk-detail-header { height: 60px; background: #f1f5f9; border-radius: 10px; margin-bottom: 16px; }
    .sk-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .sk-field { height: 48px; background: #f1f5f9; border-radius: 8px; }
  `]
})
export class SkeletonComponent {
  @Input() type: 'table' | 'cards' | 'detail' = 'table';
  @Input() count = 5;
  get rows() { return Array(this.count); }
}
