import { Component, Injectable, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ConfirmConfig { title: string; message: string; confirmText?: string; cancelText?: string; severity?: 'danger' | 'warning' | 'info'; }

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  visible = signal(false);
  config = signal<ConfirmConfig>({ title: '', message: '' });
  private resolve: ((v: boolean) => void) | null = null;

  confirm(config: ConfirmConfig): Promise<boolean> {
    this.config.set(config);
    this.visible.set(true);
    return new Promise(r => this.resolve = r);
  }

  accept() { this.resolve?.(true); this.visible.set(false); }
  reject() { this.resolve?.(false); this.visible.set(false); }
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (svc.visible()) {
      <div class="cd-overlay" (click)="svc.reject()">
        <div class="cd-panel" (click)="$event.stopPropagation()">
          <div class="cd-icon" [class]="svc.config().severity || 'warning'">
            <i class="pi" [class.pi-exclamation-triangle]="svc.config().severity !== 'danger'" [class.pi-trash]="svc.config().severity === 'danger'"></i>
          </div>
          <h3>{{ svc.config().title }}</h3>
          <p>{{ svc.config().message }}</p>
          <div class="cd-actions">
            <button class="cd-cancel" (click)="svc.reject()">{{ svc.config().cancelText || 'Cancel' }}</button>
            <button class="cd-confirm" [class]="svc.config().severity || 'warning'" (click)="svc.accept()">{{ svc.config().confirmText || 'Confirm' }}</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .cd-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.15s; }
    @keyframes fadeIn { from { opacity: 0; } }
    .cd-panel { background: #fff; border-radius: 16px; padding: 28px; max-width: 400px; width: 90%; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
    .cd-icon { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 24px; }
    .cd-icon.warning { background: #fffbeb; color: #f59e0b; }
    .cd-icon.danger { background: #fef2f2; color: #ef4444; }
    .cd-icon.info { background: #eff6ff; color: #3b82f6; }
    h3 { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 8px; }
    p { font-size: 14px; color: #64748b; margin: 0 0 24px; }
    .cd-actions { display: flex; gap: 10px; justify-content: center; }
    .cd-cancel { padding: 10px 24px; border: 1px solid #e2e8f0; border-radius: 10px; background: #fff; font-size: 14px; font-weight: 600; cursor: pointer; color: #475569; }
    .cd-confirm { padding: 10px 24px; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; color: #fff; }
    .cd-confirm.warning { background: #f59e0b; } .cd-confirm.danger { background: #ef4444; } .cd-confirm.info { background: #2563eb; }
  `]
})
export class ConfirmDialogComponent {
  constructor(public svc: ConfirmDialogService) {}
}