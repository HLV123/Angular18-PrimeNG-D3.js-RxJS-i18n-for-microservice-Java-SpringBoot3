import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-detail-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (visible) {
      <div class="overlay" (click)="close()">
        <div class="panel" [class.wide]="wide" (click)="$event.stopPropagation()">
          <div class="panel-header">
            <div>
              @if (subtitle) { <span class="panel-id">{{ subtitle }}</span> }
              <h2>{{ title }}</h2>
            </div>
            <button class="close-btn" (click)="close()"><i class="pi pi-times"></i></button>
          </div>
          @if (tabs.length > 0) {
            <div class="panel-tabs">
              @for (tab of tabs; track tab) {
                <button [class.active]="activeTab() === tab" (click)="activeTab.set(tab)">{{ tab }}</button>
              }
            </div>
          }
          <div class="panel-body">
            <ng-content></ng-content>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; justify-content: flex-end; animation: fadeIn 0.2s; }
    @keyframes fadeIn { from { opacity: 0; } }
    .panel { width: 700px; max-width: 92vw; background: #fff; height: 100vh; overflow-y: auto; box-shadow: -10px 0 40px rgba(0,0,0,0.15); animation: slideIn 0.3s ease; }
    .panel.wide { width: 900px; }
    @keyframes slideIn { from { transform: translateX(100%); } }
    .panel-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 24px; border-bottom: 1px solid #e2e8f0; }
    .panel-id { font-size: 12px; font-family: monospace; color: #64748b; }
    .panel-header h2 { font-size: 20px; font-weight: 700; color: #0f172a; margin: 4px 0 0; }
    .close-btn { background: #f1f5f9; border: none; width: 36px; height: 36px; border-radius: 10px; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; }
    .close-btn:hover { background: #e2e8f0; }
    .panel-tabs { display: flex; gap: 4px; padding: 12px 24px; border-bottom: 1px solid #e2e8f0; }
    .panel-tabs button { padding: 8px 16px; border-radius: 8px; border: none; background: none; font-size: 13px; font-weight: 500; color: #64748b; cursor: pointer; }
    .panel-tabs button.active { background: #eff6ff; color: #2563eb; font-weight: 600; }
    .panel-body { padding: 24px; }
  `]
})
export class DetailPanelComponent {
  @Input() visible = false;
  @Input() title = '';
  @Input() subtitle = '';
  @Input() tabs: string[] = [];
  @Input() wide = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() closed = new EventEmitter<void>();
  activeTab = signal('');

  ngOnChanges() { if (this.tabs.length && !this.activeTab()) this.activeTab.set(this.tabs[0]); }
  close() { this.visible = false; this.visibleChange.emit(false); this.closed.emit(); }
}
