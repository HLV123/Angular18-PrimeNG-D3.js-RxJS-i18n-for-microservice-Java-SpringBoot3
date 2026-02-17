import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InteractionService } from '../../core/services/interaction.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <h1>Settings</h1>
      <p class="subtitle">Configure system preferences and notifications</p>

      <div class="settings-grid">
        <div class="settings-card">
          <h3><i class="pi pi-bell"></i> Notification Preferences</h3>
          <div class="setting-row"><div><strong>Email Notifications</strong><p>Receive email for high-priority alerts</p></div><label class="toggle"><input type="checkbox" [(ngModel)]="settings.emailNotif" (change)="save()"><span class="slider"></span></label></div>
          <div class="setting-row"><div><strong>Push Notifications</strong><p>Browser push notifications for real-time alerts</p></div><label class="toggle"><input type="checkbox" [(ngModel)]="settings.pushNotif" (change)="save()"><span class="slider"></span></label></div>
          <div class="setting-row"><div><strong>SMS Alerts</strong><p>SMS for critical system alerts only</p></div><label class="toggle"><input type="checkbox" [(ngModel)]="settings.smsAlert" (change)="save()"><span class="slider"></span></label></div>
          <div class="setting-row"><div><strong>Daily Digest</strong><p>Daily summary email of all activities</p></div><label class="toggle"><input type="checkbox" [(ngModel)]="settings.dailyDigest" (change)="save()"><span class="slider"></span></label></div>
        </div>

        <div class="settings-card">
          <h3><i class="pi pi-palette"></i> Display Preferences</h3>
          <div class="setting-row"><div><strong>Theme</strong><p>Choose your preferred color theme</p></div><select [(ngModel)]="settings.theme" (change)="save()"><option value="light">Light</option><option value="dark">Dark</option><option value="auto">Auto (System)</option></select></div>
          <div class="setting-row"><div><strong>Language</strong><p>Interface language</p></div><select [(ngModel)]="settings.language" (change)="save()"><option value="vi">Tiếng Việt</option><option value="en">English</option></select></div>
          <div class="setting-row"><div><strong>Date Format</strong><p>Preferred date display format</p></div><select [(ngModel)]="settings.dateFormat" (change)="save()"><option value="dd/MM/yyyy">DD/MM/YYYY</option><option value="MM/dd/yyyy">MM/DD/YYYY</option><option value="yyyy-MM-dd">YYYY-MM-DD</option></select></div>
          <div class="setting-row"><div><strong>Page Size</strong><p>Default number of rows per table</p></div><select [(ngModel)]="settings.pageSize" (change)="save()"><option value="10">10</option><option value="15">15</option><option value="25">25</option><option value="50">50</option></select></div>
        </div>

        <div class="settings-card">
          <h3><i class="pi pi-shield"></i> Privacy & Security</h3>
          <div class="setting-row"><div><strong>Session Timeout</strong><p>Auto-logout after inactivity</p></div><select [(ngModel)]="settings.sessionTimeout" (change)="save()"><option value="15">15 minutes</option><option value="30">30 minutes</option><option value="60">1 hour</option><option value="120">2 hours</option></select></div>
          <div class="setting-row"><div><strong>Show Sensitive Data</strong><p>Mask PII fields by default</p></div><label class="toggle"><input type="checkbox" [(ngModel)]="settings.showSensitive" (change)="save()"><span class="slider"></span></label></div>
          <div class="setting-row"><div><strong>Activity Tracking</strong><p>Log all user actions for audit trail</p></div><label class="toggle"><input type="checkbox" [(ngModel)]="settings.activityTracking" (change)="save()"><span class="slider"></span></label></div>
        </div>

        <div class="settings-card">
          <h3><i class="pi pi-bolt"></i> Real-time Settings</h3>
          <div class="setting-row"><div><strong>Live Transaction Feed</strong><p>Enable real-time transaction stream via Kafka</p></div><label class="toggle"><input type="checkbox" [(ngModel)]="settings.liveStream" (change)="save()"><span class="slider"></span></label></div>
          <div class="setting-row"><div><strong>Auto-refresh Dashboards</strong><p>Automatically refresh dashboard data</p></div><label class="toggle"><input type="checkbox" [(ngModel)]="settings.autoRefresh" (change)="save()"><span class="slider"></span></label></div>
          <div class="setting-row"><div><strong>Refresh Interval</strong><p>How often to refresh data</p></div><select [(ngModel)]="settings.refreshInterval" (change)="save()"><option value="10">10 seconds</option><option value="30">30 seconds</option><option value="60">1 minute</option><option value="300">5 minutes</option></select></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 1200px; margin: 0 auto; }
    h1 { font-size: 28px; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
    .subtitle { font-size: 14px; color: #64748b; margin-bottom: 24px; }
    .settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .settings-card { background: #fff; border-radius: 16px; padding: 24px; border: 1px solid #e2e8f0; }
    .settings-card h3 { font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 16px; display: flex; align-items: center; gap: 10px; }
    .settings-card h3 i { color: #2563eb; }
    .setting-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid #f1f5f9; }
    .setting-row:last-child { border-bottom: none; }
    .setting-row strong { font-size: 14px; color: #1e293b; display: block; }
    .setting-row p { font-size: 12px; color: #64748b; margin: 2px 0 0; }
    .setting-row select { padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13px; background: #fff; cursor: pointer; outline: none; }
    .toggle { position: relative; display: inline-block; width: 48px; height: 26px; flex-shrink: 0; }
    .toggle input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; inset: 0; background: #cbd5e1; border-radius: 26px; transition: 0.3s; }
    .slider::before { content: ''; position: absolute; width: 20px; height: 20px; border-radius: 50%; background: #fff; left: 3px; bottom: 3px; transition: 0.3s; }
    .toggle input:checked + .slider { background: #2563eb; }
    .toggle input:checked + .slider::before { transform: translateX(22px); }
    @media (max-width: 768px) { .settings-grid { grid-template-columns: 1fr; } }
  `]
})
export class SettingsComponent {
  settings = {
    emailNotif: true, pushNotif: true, smsAlert: false, dailyDigest: true,
    theme: 'light', language: 'vi', dateFormat: 'dd/MM/yyyy', pageSize: '15',
    sessionTimeout: '30', showSensitive: false, activityTracking: true,
    liveStream: true, autoRefresh: true, refreshInterval: '30',
  };

  constructor(private interact: InteractionService) {
    const saved = localStorage.getItem('iris_settings');
    if (saved) { try { Object.assign(this.settings, JSON.parse(saved)); } catch {} }
  }

  save() {
    localStorage.setItem('iris_settings', JSON.stringify(this.settings));
    this.interact.success('Settings saved');
  }
}
