import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty">
      <div class="empty-icon"><i [class]="icon"></i></div>
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      @if (actionLabel) { <button class="empty-btn" (click)="action.emit()"><i class="pi pi-plus"></i> {{ actionLabel }}</button> }
    </div>
  `,
  styles: [`
    .empty { text-align: center; padding: 60px 20px; background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; }
    .empty-icon { font-size: 48px; color: #cbd5e1; margin-bottom: 16px; }
    h3 { font-size: 18px; font-weight: 700; color: #475569; margin: 0 0 8px; }
    p { font-size: 14px; color: #94a3b8; margin: 0 0 20px; max-width: 400px; margin-left: auto; margin-right: auto; }
    .empty-btn { padding: 10px 24px; background: linear-gradient(135deg,#1e3a8a,#2563eb); color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
  `]
})
export class EmptyStateComponent {
  @Input() icon = 'pi pi-inbox';
  @Input() title = 'No data found';
  @Input() message = 'There are no records to display yet.';
  @Input() actionLabel = '';
  @Output() action = new EventEmitter<void>();
}