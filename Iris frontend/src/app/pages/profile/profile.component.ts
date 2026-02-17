import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { InteractionService } from '../../core/services/interaction.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <h1>My Profile</h1>
      <p class="subtitle">Manage your personal information and preferences</p>

      <div class="profile-grid">
        <div class="profile-card avatar-section">
          <img src="assets/images/avatar-default.png" class="avatar-lg" />
          <h3>{{ auth.user()?.fullName }}</h3>
          <p class="role-text">{{ formatRole(auth.user()?.role || '') }}</p>
          <p class="dept-text">{{ auth.user()?.department }}</p>
          <button class="btn-sm" (click)="interact.info('Avatar upload will connect to backend API')">Change Avatar</button>
        </div>

        <div class="profile-card form-section">
          <h3>Personal Information</h3>
          <div class="form-grid">
            <div class="field"><label>First Name</label><input type="text" [(ngModel)]="form.firstName" /></div>
            <div class="field"><label>Last Name</label><input type="text" [(ngModel)]="form.lastName" /></div>
            <div class="field full"><label>Email</label><input type="email" [(ngModel)]="form.email" /></div>
            <div class="field"><label>Department</label><input type="text" [value]="auth.user()?.department" disabled /></div>
            <div class="field"><label>Role</label><input type="text" [value]="formatRole(auth.user()?.role || '')" disabled /></div>
            <div class="field full"><label>Phone</label><input type="tel" [(ngModel)]="form.phone" placeholder="+84 xxx xxx xxx" /></div>
          </div>
          <div class="form-actions">
            <button class="btn-outline" (click)="resetForm()">Reset</button>
            <button class="btn-primary" (click)="saveProfile()"><i class="pi pi-check"></i> Save Changes</button>
          </div>
        </div>

        <div class="profile-card">
          <h3>Security</h3>
          <div class="security-item">
            <div><strong>Password</strong><p>Last changed 30 days ago</p></div>
            <button class="btn-sm outline" (click)="showPasswordDialog.set(true)">Change Password</button>
          </div>
          <div class="security-item">
            <div><strong>Two-Factor Authentication</strong><p>{{ twoFactorEnabled ? 'Enabled' : 'Disabled' }}</p></div>
            <button class="btn-sm" [class.outline]="twoFactorEnabled" (click)="toggleTwoFactor()">{{ twoFactorEnabled ? 'Disable' : 'Enable' }}</button>
          </div>
          <div class="security-item">
            <div><strong>Active Sessions</strong><p>1 active session</p></div>
            <button class="btn-sm outline" (click)="interact.info('Session management will connect to Keycloak')">Manage</button>
          </div>
        </div>

        <div class="profile-card">
          <h3>Activity Log</h3>
          <div class="activity-list">
            <div class="activity-item"><i class="pi pi-sign-in"></i><div><strong>Login</strong><small>Today 09:15 · 192.168.1.100</small></div></div>
            <div class="activity-item"><i class="pi pi-pencil"></i><div><strong>Updated Risk RSK-012</strong><small>Yesterday 16:30</small></div></div>
            <div class="activity-item"><i class="pi pi-eye"></i><div><strong>Viewed Case CAS-035</strong><small>Yesterday 14:22</small></div></div>
            <div class="activity-item"><i class="pi pi-sign-in"></i><div><strong>Login</strong><small>Feb 14 08:45 · 192.168.1.100</small></div></div>
          </div>
        </div>
      </div>

      @if (showPasswordDialog()) {
        <div class="overlay" (click)="showPasswordDialog.set(false)">
          <div class="dialog" (click)="$event.stopPropagation()">
            <h3>Change Password</h3>
            <div class="field"><label>Current Password</label><input type="password" [(ngModel)]="passwords.current" /></div>
            <div class="field"><label>New Password</label><input type="password" [(ngModel)]="passwords.newPass" /></div>
            <div class="field"><label>Confirm Password</label><input type="password" [(ngModel)]="passwords.confirm" /></div>
            <div class="dialog-actions">
              <button class="btn-outline" (click)="showPasswordDialog.set(false)">Cancel</button>
              <button class="btn-primary" (click)="changePassword()">Update Password</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 1200px; margin: 0 auto; }
    h1 { font-size: 28px; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
    .subtitle { font-size: 14px; color: #64748b; margin-bottom: 24px; }
    .profile-grid { display: grid; grid-template-columns: 280px 1fr; gap: 20px; }
    .profile-card { background: #fff; border-radius: 16px; padding: 24px; border: 1px solid #e2e8f0; }
    .profile-card h3 { font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 16px; }
    .avatar-section { text-align: center; }
    .avatar-lg { width: 96px; height: 96px; border-radius: 20px; margin-bottom: 12px; }
    .avatar-section h3 { margin-bottom: 4px; }
    .role-text { font-size: 13px; color: #2563eb; font-weight: 600; margin-bottom: 2px; }
    .dept-text { font-size: 13px; color: #64748b; margin-bottom: 16px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field.full { grid-column: span 2; }
    .field label { font-size: 13px; font-weight: 600; color: #374151; }
    .field input { padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 14px; outline: none; }
    .field input:focus { border-color: #2563eb; }
    .field input:disabled { background: #f8fafc; color: #94a3b8; }
    .form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; padding-top: 16px; border-top: 1px solid #f1f5f9; }
    .btn-outline, .btn-primary { padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; border: none; }
    .btn-outline { background: #fff; border: 1px solid #e2e8f0; color: #475569; }
    .btn-primary { background: linear-gradient(135deg, #1e3a8a, #2563eb); color: #fff; }
    .btn-sm { padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; background: #2563eb; color: #fff; }
    .btn-sm.outline { background: #fff; border: 1px solid #e2e8f0; color: #475569; }
    .security-item { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid #f1f5f9; }
    .security-item strong { font-size: 14px; color: #1e293b; display: block; }
    .security-item p { font-size: 12px; color: #64748b; margin: 2px 0 0; }
    .activity-list { display: flex; flex-direction: column; }
    .activity-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f8fafc; }
    .activity-item i { font-size: 16px; color: #64748b; width: 24px; }
    .activity-item strong { font-size: 13px; color: #1e293b; display: block; }
    .activity-item small { font-size: 11px; color: #94a3b8; }
    .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 300; display: flex; align-items: center; justify-content: center; }
    .dialog { background: #fff; border-radius: 20px; padding: 32px; width: 420px; max-width: 90vw; }
    .dialog h3 { font-size: 20px; font-weight: 700; margin-bottom: 20px; }
    .dialog .field { margin-bottom: 14px; }
    .dialog-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
    @media (max-width: 768px) { .profile-grid { grid-template-columns: 1fr; } .form-grid { grid-template-columns: 1fr; } .field.full { grid-column: span 1; } }
  `]
})
export class ProfileComponent {
  form = { firstName: '', lastName: '', email: '', phone: '' };
  passwords = { current: '', newPass: '', confirm: '' };
  showPasswordDialog = signal(false);
  twoFactorEnabled = false;

  constructor(public auth: AuthService, public interact: InteractionService) {
    const u = this.auth.user();
    if (u) {
      this.form.firstName = u.firstName || u.fullName?.split(' ')[0] || '';
      this.form.lastName = u.lastName || u.fullName?.split(' ').slice(1).join(' ') || '';
      this.form.email = u.email || '';
    }
  }

  formatRole(r: string) { return r.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()); }
  resetForm() {
    const u = this.auth.user();
    if (u) { this.form.firstName = u.firstName || ''; this.form.lastName = u.lastName || ''; this.form.email = u.email || ''; this.form.phone = ''; }
    this.interact.info('Form reset to original values');
  }
  saveProfile() { this.interact.success('Profile updated successfully'); }
  toggleTwoFactor() { this.twoFactorEnabled = !this.twoFactorEnabled; this.interact.success(this.twoFactorEnabled ? '2FA enabled' : '2FA disabled'); }
  changePassword() {
    if (!this.passwords.current || !this.passwords.newPass) { this.interact.error('Please fill all fields'); return; }
    if (this.passwords.newPass !== this.passwords.confirm) { this.interact.error('Passwords do not match'); return; }
    if (this.passwords.newPass.length < 6) { this.interact.error('Password must be at least 6 characters'); return; }
    this.showPasswordDialog.set(false);
    this.passwords = { current: '', newPass: '', confirm: '' };
    this.interact.success('Password changed successfully');
  }
}
