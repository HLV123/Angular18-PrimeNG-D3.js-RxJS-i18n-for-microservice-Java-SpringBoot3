import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InteractionService } from '../../core/services/interaction.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (t of svc.toasts(); track t.id) {
        <div class="toast" [class]="'toast-' + t.severity" (click)="dismiss(t.id)">
          <i [class]="getIcon(t.severity)"></i>
          <div><strong>{{ t.summary }}</strong><p>{{ t.detail }}</p></div>
          <i class="pi pi-times close"></i>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container { position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 8px; max-width: 380px; }
    .toast { display: flex; align-items: flex-start; gap: 12px; padding: 14px 18px; border-radius: 12px; color: #fff; cursor: pointer; animation: slideIn 0.3s ease; box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    .toast-success { background: #16a34a; } .toast-info { background: #2563eb; } .toast-warn { background: #d97706; } .toast-error { background: #dc2626; }
    .toast i:first-child { font-size: 18px; margin-top: 2px; }
    .toast strong { font-size: 14px; display: block; }
    .toast p { font-size: 12px; opacity: 0.9; margin: 2px 0 0; }
    .close { margin-left: auto; font-size: 14px; opacity: 0.7; cursor: pointer; }
    .close:hover { opacity: 1; }
  `]
})
export class ToastComponent {
  constructor(public svc: InteractionService) {}
  getIcon(s: string) { return { success: 'pi pi-check-circle', info: 'pi pi-info-circle', warn: 'pi pi-exclamation-triangle', error: 'pi pi-times-circle' }[s] || 'pi pi-info-circle'; }
  dismiss(id: number) { this.svc.toasts.update(t => t.filter(x => x.id !== id)); }
}
