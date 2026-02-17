import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="unauth-page">
      <div class="unauth-card">
        <div class="lock-icon"><i class="pi pi-lock"></i></div>
        <h2>Access Denied</h2>
        <p>Your role <strong>{{ formatRole(auth.user()?.role || '') }}</strong> does not have permission to access this page.</p>
        <p class="sub">Contact your administrator if you believe this is an error.</p>
        <div class="actions">
          <a routerLink="/dashboard" class="btn-primary"><i class="pi pi-home"></i> Go to Dashboard</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .unauth-page { display: flex; align-items: center; justify-content: center; min-height: 70vh; padding: 48px; }
    .unauth-card { text-align: center; background: #fff; border-radius: 24px; padding: 56px 48px; border: 1px solid #e2e8f0; max-width: 500px; width: 100%; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
    .lock-icon { width: 80px; height: 80px; border-radius: 50%; background: #fef2f2; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
    .lock-icon i { font-size: 36px; color: #ef4444; }
    h2 { font-size: 26px; font-weight: 800; color: #0f172a; margin-bottom: 12px; }
    p { font-size: 15px; color: #64748b; line-height: 1.6; margin-bottom: 8px; }
    p strong { color: #1e293b; }
    .sub { font-size: 13px; color: #94a3b8; margin-bottom: 24px; }
    .btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 12px 28px; background: linear-gradient(135deg, #1e3a8a, #2563eb); color: #fff; border-radius: 12px; font-size: 15px; font-weight: 600; text-decoration: none; }
    .btn-primary:hover { box-shadow: 0 4px 16px rgba(37,99,235,0.3); }
  `]
})
export class UnauthorizedComponent {
  constructor(public auth: AuthService) {}
  formatRole(role: string): string {
    return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}
