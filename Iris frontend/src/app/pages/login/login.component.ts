import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-bg">
        <img src="assets/images/login-bg.jpg.png" alt="Background" class="bg-image" />
        <div class="bg-overlay"></div>
        <div class="bg-content">
          <img src="assets/images/logo.png" alt="IRIS Logo" class="bg-logo" />
          <h1>Intelligent Risk & Fraud Platform</h1>
          <p>Nền Tảng Quản Trị Rủi Ro & Phòng Chống Gian Lận</p>
          <div class="features-list">
            <div class="feature-item">
              <i class="pi pi-shield"></i>
              <span>Enterprise Risk Management</span>
            </div>
            <div class="feature-item">
              <i class="pi pi-search"></i>
              <span>Fraud Detection & Prevention</span>
            </div>
            <div class="feature-item">
              <i class="pi pi-chart-bar"></i>
              <span>Real-time Analytics & AI/ML</span>
            </div>
            <div class="feature-item">
              <i class="pi pi-check-circle"></i>
              <span>Compliance & Audit Trail</span>
            </div>
          </div>
        </div>
      </div>

      <div class="login-panel">
        <div class="login-form-wrapper">
          <div class="login-header">
            <img src="assets/images/logo.png" alt="IRIS" class="form-logo" />
            <h2>Welcome Back</h2>
            <p>Sign in to your account</p>
          </div>

          <form (ngSubmit)="onLogin()" class="login-form">
            <div class="form-group">
              <label for="username">
                <i class="pi pi-user"></i> Username
              </label>
              <input type="text" id="username" [(ngModel)]="username" name="username"
                     placeholder="Enter your username" autofocus required
                     [class.error]="errorMessage()" />
            </div>

            <div class="form-group">
              <label for="password">
                <i class="pi pi-lock"></i> Password
              </label>
              <div class="password-input">
                <input [type]="showPassword() ? 'text' : 'password'" id="password"
                       [(ngModel)]="password" name="password"
                       placeholder="Enter your password" required
                       [class.error]="errorMessage()" />
                <button type="button" class="toggle-pwd" (click)="showPassword.set(!showPassword())">
                  <i [class]="showPassword() ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
                </button>
              </div>
            </div>

            @if (errorMessage()) {
              <div class="error-message">
                <i class="pi pi-exclamation-circle"></i>
                {{ errorMessage() }}
              </div>
            }

            <div class="form-options">
              <label class="remember-me">
                <input type="checkbox" [(ngModel)]="rememberMe" name="remember" />
                <span>Remember me</span>
              </label>
              <a href="javascript:void(0)" class="forgot-pwd">Forgot password?</a>
            </div>

            <button type="submit" class="btn-login" [disabled]="loading()">
              @if (loading()) {
                <i class="pi pi-spin pi-spinner"></i>
                Signing in...
              } @else {
                <i class="pi pi-sign-in"></i>
                Sign In
              }
            </button>
          </form>

          <div class="demo-accounts">
            <h4>
              <i class="pi pi-info-circle"></i>
              Demo Accounts
            </h4>
            <div class="accounts-grid">
              @for (cred of credentials; track cred.username) {
                <button class="account-chip" (click)="fillCredentials(cred.username, cred.password)"
                        [title]="cred.fullName">
                  <span class="chip-role">{{ formatRole(cred.role) }}</span>
                  <span class="chip-user">{{ cred.username }}</span>
                </button>
              }
            </div>
          </div>

          <div class="login-footer">
            <p>Powered by <strong>IRIS Platform</strong> v2.0</p>
            <p class="tech-stack">Angular 18 · Spring Boot · Keycloak · Kafka · Spark</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      min-height: 100vh;
      background: #0a0e1a;
    }

    .login-bg {
      flex: 1.2;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .bg-image {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .bg-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(10, 14, 30, 0.85) 0%, rgba(15, 23, 42, 0.75) 50%, rgba(30, 58, 138, 0.65) 100%);
    }

    .bg-content {
      position: relative;
      z-index: 2;
      text-align: center;
      padding: 48px;
      max-width: 540px;
    }

    .bg-logo {
      width: 120px;
      height: 120px;
      border-radius: 28px;
      margin-bottom: 24px;
      box-shadow: 0 20px 60px rgba(37, 99, 235, 0.3);
    }

    .bg-content h1 {
      font-size: 32px;
      font-weight: 800;
      color: #fff;
      margin-bottom: 8px;
      letter-spacing: -0.5px;
    }

    .bg-content p {
      color: rgba(255,255,255,0.7);
      font-size: 16px;
      margin-bottom: 40px;
    }

    .features-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      text-align: left;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 14px;
      color: rgba(255,255,255,0.85);
      font-size: 15px;
      padding: 12px 20px;
      background: rgba(255,255,255,0.05);
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.08);
      backdrop-filter: blur(10px);
      transition: all 0.3s;
    }

    .feature-item:hover {
      background: rgba(255,255,255,0.1);
      transform: translateX(8px);
    }

    .feature-item i {
      font-size: 20px;
      color: #60a5fa;
      width: 24px;
      text-align: center;
    }

    .login-panel {
      flex: 0.8;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fff;
      padding: 48px;
    }

    .login-form-wrapper {
      width: 100%;
      max-width: 420px;
    }

    .login-header {
      text-align: center;
      margin-bottom: 36px;
    }

    .form-logo {
      width: 72px;
      height: 72px;
      border-radius: 18px;
      margin-bottom: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .login-header h2 {
      font-size: 28px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 4px;
    }

    .login-header p {
      color: #64748b;
      font-size: 15px;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-group label {
      font-size: 13px;
      font-weight: 600;
      color: #374151;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .form-group label i {
      font-size: 14px;
      color: #6b7280;
    }

    .form-group input {
      padding: 12px 16px;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      font-size: 15px;
      transition: all 0.2s;
      outline: none;
      width: 100%;
      box-sizing: border-box;
    }

    .form-group input:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .form-group input.error {
      border-color: #ef4444;
    }

    .password-input {
      position: relative;
    }

    .password-input input {
      padding-right: 44px;
    }

    .toggle-pwd {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      padding: 4px;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 10px;
      color: #dc2626;
      font-size: 14px;
    }

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .remember-me {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #4b5563;
      cursor: pointer;
    }

    .forgot-pwd {
      font-size: 14px;
      color: #2563eb;
      text-decoration: none;
      font-weight: 500;
    }

    .btn-login {
      padding: 14px 24px;
      background: linear-gradient(135deg, #1e3a8a, #2563eb);
      color: #fff;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.3s;
      box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
    }

    .btn-login:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
    }

    .btn-login:disabled {
      opacity: 0.7;
      cursor: wait;
    }

    .demo-accounts {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
    }

    .demo-accounts h4 {
      font-size: 13px;
      font-weight: 600;
      color: #6b7280;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .accounts-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }

    .account-chip {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: 10px 14px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
    }

    .account-chip:hover {
      background: #eff6ff;
      border-color: #93c5fd;
      transform: translateY(-1px);
    }

    .chip-role {
      font-size: 10px;
      font-weight: 700;
      color: #2563eb;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .chip-user {
      font-size: 13px;
      color: #374151;
      font-weight: 500;
    }

    .login-footer {
      text-align: center;
      margin-top: 32px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }

    .login-footer p {
      font-size: 12px;
      color: #9ca3af;
    }

    .tech-stack {
      font-size: 11px !important;
      margin-top: 4px;
    }

    @media (max-width: 1024px) {
      .login-bg { display: none; }
      .login-panel { flex: 1; }
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  rememberMe = false;
  showPassword = signal(false);
  loading = signal(false);
  errorMessage = signal('');
  credentials: any[] = [];

  constructor(private auth: AuthService, private router: Router) {
    if (auth.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
    this.credentials = this.auth.getAvailableCredentials();
  }

  fillCredentials(username: string, password: string) {
    this.username = username;
    this.password = password;
    this.errorMessage.set('');
  }

  formatRole(role: string): string {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()).substring(0, 16);
  }

  onLogin() {
    this.loading.set(true);
    this.errorMessage.set('');
    setTimeout(() => {
      const success = this.auth.login(this.username, this.password);
      if (success) {
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage.set('Invalid username or password. Please try again.');
      }
      this.loading.set(false);
    }, 800);
  }
}
