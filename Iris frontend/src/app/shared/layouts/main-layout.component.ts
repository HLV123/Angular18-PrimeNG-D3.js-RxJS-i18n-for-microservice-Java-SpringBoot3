import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { BreadcrumbComponent } from '../components/breadcrumb/breadcrumb.component';
import { NotificationCenterComponent } from '../components/notification-center/notification-center.component';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { MockDataService } from '../../core/services/mock-data.service';
import { Notification, UserRole } from '../../core/models';

interface MenuItem {
  route: string;
  label: string;
  icon: string;
  badge: string | null;
  badgeType: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, BreadcrumbComponent, NotificationCenterComponent],
  template: `
    <div class="app-layout" [class.sidebar-collapsed]="sidebarCollapsed()">
      <!-- SIDEBAR -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <img src="assets/images/logo.png" alt="IRIS" class="sidebar-logo" />
          @if (!sidebarCollapsed()) {
            <div class="sidebar-brand">
              <span class="brand-name">IRIS</span>
              <span class="brand-sub">Platform</span>
            </div>
          }
        </div>

        <!-- ROLE BADGE -->
        @if (!sidebarCollapsed()) {
          <div class="role-badge-section">
            <div class="role-badge" [style.background]="getRoleBadgeColor()">
              <i [class]="getRoleIcon()"></i>
              <div class="role-info">
                <span class="role-name">{{ formatRole(auth.user()?.role || '') }}</span>
                <span class="role-dept">{{ auth.user()?.department }}</span>
              </div>
            </div>
          </div>
        }

        <nav class="sidebar-nav">
          @for (item of visibleMenuItems(); track item.route) {
            <a [routerLink]="item.route" routerLinkActive="active"
               class="nav-item" [title]="item.label">
              <i [class]="item.icon"></i>
              @if (!sidebarCollapsed()) {
                <span class="nav-label">{{ item.label }}</span>
                @if (item.badge) {
                  <span class="nav-badge" [class]="'badge-' + item.badgeType">{{ item.badge }}</span>
                }
              }
            </a>
          }
        </nav>

        @if (!sidebarCollapsed()) {
          <div class="sidebar-access-info">
            <i class="pi pi-info-circle"></i>
            <span>{{ visibleMenuItems().length }} of {{ allMenuItems.length }} modules accessible</span>
          </div>
        }

        <div class="sidebar-footer">
          <button class="collapse-btn" (click)="sidebarCollapsed.set(!sidebarCollapsed())">
            <i [class]="sidebarCollapsed() ? 'pi pi-angle-double-right' : 'pi pi-angle-double-left'"></i>
          </button>
        </div>
      </aside>

      <!-- MAIN CONTENT -->
      <div class="main-content">
            <app-breadcrumb></app-breadcrumb>
        <!-- TOP BAR -->
        <header class="topbar">
          <div class="topbar-left">
            <button class="menu-toggle" (click)="sidebarCollapsed.set(!sidebarCollapsed())">
              <i class="pi pi-bars"></i>
            </button>
            <div class="search-box">
              <i class="pi pi-search"></i>
              <input type="text" placeholder="Search risks, alerts, cases..."
                     [(ngModel)]="globalSearch" (input)="onGlobalSearch()" (keydown.enter)="onGlobalSearch()" />
              @if (searchResults().length > 0) {
                <div class="search-dropdown">
                  @for (r of searchResults(); track r.id) {
                    <a class="search-item" [routerLink]="r.route" (click)="clearSearch()">
                      <i [class]="r.icon"></i>
                      <div><strong>{{ r.title }}</strong><small>{{ r.type }} · {{ r.subtitle }}</small></div>
                    </a>
                  }
                </div>
              }
            </div>
          </div>

          <div class="topbar-right" style="position:relative">
              <app-notification-center></app-notification-center>
            <div class="topbar-item" title="Kafka Stream Status">
              <i class="pi pi-bolt status-on"></i>
              <span class="status-text">Live</span>
            </div>

            <!-- ROLE INDICATOR in topbar -->
            <div class="role-chip" [style.background]="getRoleBadgeColor()">
              <i [class]="getRoleIcon()"></i>
              <span>{{ formatRole(auth.user()?.role || '') }}</span>
            </div>

            <button class="topbar-btn" (click)="showNotifications.set(!showNotifications())" title="Notifications">
              <i class="pi pi-bell"></i>
              @if (unreadCount() > 0) {
                <span class="notif-badge">{{ unreadCount() }}</span>
              }
            </button>

            <div class="user-menu" (click)="showUserMenu.set(!showUserMenu())">
              <img src="assets/images/avatar-default.png" alt="Avatar" class="user-avatar" />
              <div class="user-info">
                <span class="user-name">{{ auth.user()?.fullName }}</span>
                <span class="user-role">{{ auth.user()?.department }}</span>
              </div>
              <i class="pi pi-chevron-down"></i>
            </div>

            @if (showUserMenu()) {
              <div class="dropdown-menu user-dropdown" (mouseleave)="showUserMenu.set(false)">
                <div class="dropdown-header">
                  <img src="assets/images/avatar-default.png" alt="Avatar" class="dropdown-avatar" />
                  <div>
                    <strong>{{ auth.user()?.fullName }}</strong>
                    <small>{{ auth.user()?.email }}</small>
                    <small class="role-label">{{ formatRole(auth.user()?.role || '') }}</small>
                  </div>
                </div>
                <div class="dropdown-divider"></div>
                <div class="dropdown-section-label">Accessible Modules: {{ visibleMenuItems().length }}</div>
                <a class="dropdown-item" routerLink="/profile"><i class="pi pi-user"></i> My Profile</a>
                <a class="dropdown-item" routerLink="/settings"><i class="pi pi-cog"></i> Settings</a>
                <div class="dropdown-divider"></div>
                <button class="dropdown-item logout" (click)="onLogout()"><i class="pi pi-sign-out"></i> Sign Out</button>
              </div>
            }

            @if (showNotifications()) {
              <div class="dropdown-menu notif-dropdown" (mouseleave)="showNotifications.set(false)">
                <div class="notif-header">
                  <strong>Notifications</strong>
                  <button (click)="markAllRead()">Mark all read</button>
                </div>
                @for (notif of roleFilteredNotifications(); track notif.id) {
                  <div class="notif-item" [class.unread]="!notif.read">
                    <i [class]="notif.icon || 'pi pi-info-circle'" [class.notif-icon]="true"
                       [style.color]="getNotifColor(notif.type)"></i>
                    <div class="notif-content">
                      <strong>{{ notif.title }}</strong>
                      <p>{{ notif.message }}</p>
                      <small>{{ getTimeAgo(notif.createdAt) }}</small>
                    </div>
                  </div>
                }
                @if (roleFilteredNotifications().length === 0) {
                  <div class="notif-empty"><i class="pi pi-check-circle"></i><p>No notifications for your role</p></div>
                }
              </div>
            }
          </div>
        </header>

        <!-- PAGE CONTENT -->
        <main class="page-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .app-layout { display: flex; min-height: 100vh; background: #f1f5f9; }

    .sidebar {
      width: 270px; background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
      display: flex; flex-direction: column; position: fixed; top: 0; left: 0; bottom: 0;
      z-index: 100; transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1); overflow-x: hidden;
    }
    .sidebar-collapsed .sidebar { width: 72px; }

    .sidebar-header { display: flex; align-items: center; gap: 12px; padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .sidebar-logo { width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0; }
    .sidebar-brand { display: flex; flex-direction: column; overflow: hidden; }
    .brand-name { font-size: 20px; font-weight: 800; color: #fff; letter-spacing: 2px; }
    .brand-sub { font-size: 11px; color: #64748b; letter-spacing: 1px; text-transform: uppercase; }

    .role-badge-section { padding: 12px 16px; }
    .role-badge {
      display: flex; align-items: center; gap: 10px; padding: 10px 14px;
      border-radius: 10px; color: #fff; font-size: 13px;
    }
    .role-badge i { font-size: 16px; }
    .role-info { display: flex; flex-direction: column; overflow: hidden; }
    .role-name { font-weight: 700; font-size: 12px; white-space: nowrap; }
    .role-dept { font-size: 10px; opacity: 0.7; white-space: nowrap; }

    .sidebar-nav { flex: 1; padding: 8px 8px; overflow-y: auto; overflow-x: hidden; }
    .sidebar-nav::-webkit-scrollbar { width: 4px; }
    .sidebar-nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

    .nav-item {
      display: flex; align-items: center; gap: 12px; padding: 11px 16px; border-radius: 10px;
      color: #94a3b8; text-decoration: none; font-size: 14px; font-weight: 500;
      margin-bottom: 2px; transition: all 0.2s; white-space: nowrap; overflow: hidden; position: relative;
    }
    .nav-item:hover { background: rgba(255,255,255,0.06); color: #e2e8f0; }
    .nav-item.active {
      background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(37, 99, 235, 0.1));
      color: #60a5fa; font-weight: 600;
    }
    .nav-item.active::before {
      content: ''; position: absolute; left: 0; width: 3px; height: 24px;
      background: #2563eb; border-radius: 0 4px 4px 0;
    }
    .nav-item i { font-size: 18px; width: 24px; text-align: center; flex-shrink: 0; }
    .nav-badge { margin-left: auto; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 20px; }
    .badge-danger { background: #ef4444; color: #fff; }
    .badge-warning { background: #f59e0b; color: #fff; }
    .badge-info { background: #3b82f6; color: #fff; }

    .sidebar-access-info {
      display: flex; align-items: center; gap: 8px; padding: 10px 16px;
      font-size: 11px; color: #475569; border-top: 1px solid rgba(255,255,255,0.04);
    }
    .sidebar-access-info i { font-size: 12px; }

    .sidebar-footer { padding: 12px; border-top: 1px solid rgba(255,255,255,0.06); }
    .collapse-btn {
      width: 100%; padding: 10px; background: rgba(255,255,255,0.04); border: none;
      border-radius: 8px; color: #64748b; cursor: pointer;
    }
    .collapse-btn:hover { background: rgba(255,255,255,0.08); color: #94a3b8; }

    .main-content {
      margin-left: 270px; flex: 1; display: flex; flex-direction: column;
      transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .sidebar-collapsed .main-content { margin-left: 72px; }

    .topbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 24px; background: #fff; border-bottom: 1px solid #e2e8f0;
      position: sticky; top: 0; z-index: 50;
    }
    .topbar-left { display: flex; align-items: center; gap: 16px; flex: 1; }
    .menu-toggle {
      background: none; border: none; font-size: 20px; color: #64748b;
      cursor: pointer; padding: 8px; border-radius: 8px;
    }
    .menu-toggle:hover { background: #f1f5f9; }
    .search-box {
      display: flex; align-items: center; gap: 10px; background: #f8fafc;
      border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 16px;
      max-width: 500px; flex: 1;
    }
    .search-box i { color: #94a3b8; }
    .search-box input { border: none; background: transparent; font-size: 14px; width: 100%; outline: none; color: #334155; }
    .search-box { position: relative; }
    .search-dropdown { position: absolute; top: 100%; left: 0; right: 0; background: #fff; border-radius: 12px; box-shadow: 0 12px 40px rgba(0,0,0,0.15); border: 1px solid #e2e8f0; margin-top: 8px; z-index: 300; max-height: 400px; overflow-y: auto; }
    .search-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; text-decoration: none; color: #334155; cursor: pointer; border-bottom: 1px solid #f1f5f9; }
    .search-item:hover { background: #f8fafc; }
    .search-item:last-child { border-bottom: none; }
    .search-item i { font-size: 18px; color: #64748b; width: 24px; }
    .search-item strong { font-size: 13px; color: #1e293b; display: block; }
    .search-item small { font-size: 11px; color: #94a3b8; }

    .topbar-right { display: flex; align-items: center; gap: 12px; position: relative; }
    .topbar-item { display: flex; align-items: center; gap: 6px; }
    .status-on { font-size: 12px; color: #22c55e; }
    .status-text { font-size: 12px; font-weight: 600; color: #22c55e; }

    .role-chip {
      display: flex; align-items: center; gap: 6px; padding: 5px 12px;
      border-radius: 20px; font-size: 11px; font-weight: 700; color: #fff;
    }
    .role-chip i { font-size: 12px; }

    .topbar-btn {
      position: relative; background: none; border: none; font-size: 20px;
      color: #64748b; cursor: pointer; padding: 8px; border-radius: 8px;
    }
    .topbar-btn:hover { background: #f1f5f9; }
    .notif-badge {
      position: absolute; top: 2px; right: 2px; background: #ef4444; color: #fff;
      font-size: 10px; font-weight: 700; min-width: 18px; height: 18px;
      border-radius: 10px; display: flex; align-items: center; justify-content: center;
    }

    .user-menu {
      display: flex; align-items: center; gap: 10px; cursor: pointer;
      padding: 6px 12px; border-radius: 12px;
    }
    .user-menu:hover { background: #f1f5f9; }
    .user-avatar { width: 36px; height: 36px; border-radius: 10px; object-fit: cover; }
    .user-info { display: flex; flex-direction: column; }
    .user-name { font-size: 14px; font-weight: 600; color: #1e293b; }
    .user-role { font-size: 11px; color: #64748b; }
    .user-menu > i { font-size: 12px; color: #94a3b8; }

    .dropdown-menu {
      position: absolute; top: 60px; right: 0; background: #fff; border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15); border: 1px solid #e2e8f0; z-index: 200; overflow: hidden;
    }
    .user-dropdown { width: 280px; }
    .notif-dropdown { width: 380px; max-height: 480px; overflow-y: auto; }

    .dropdown-header { display: flex; align-items: center; gap: 12px; padding: 16px; }
    .dropdown-avatar { width: 42px; height: 42px; border-radius: 10px; }
    .dropdown-header strong { display: block; font-size: 14px; color: #1e293b; }
    .dropdown-header small { font-size: 12px; color: #64748b; display: block; }
    .role-label { font-size: 11px; color: #2563eb; font-weight: 600; }
    .dropdown-divider { height: 1px; background: #e2e8f0; }
    .dropdown-section-label { font-size: 11px; color: #94a3b8; padding: 8px 16px; font-weight: 600; }
    .dropdown-item {
      display: flex; align-items: center; gap: 10px; padding: 10px 16px; color: #475569;
      text-decoration: none; font-size: 14px; cursor: pointer; border: none; background: none; width: 100%; text-align: left;
    }
    .dropdown-item:hover { background: #f8fafc; }
    .dropdown-item.logout { color: #ef4444; }

    .notif-header { display: flex; justify-content: space-between; align-items: center; padding: 16px; border-bottom: 1px solid #e2e8f0; }
    .notif-header strong { font-size: 16px; color: #1e293b; }
    .notif-header button { background: none; border: none; color: #2563eb; font-size: 13px; cursor: pointer; font-weight: 500; }
    .notif-item { display: flex; gap: 12px; padding: 12px 16px; border-bottom: 1px solid #f1f5f9; }
    .notif-item:hover { background: #f8fafc; }
    .notif-item.unread { background: #eff6ff; }
    .notif-icon { font-size: 18px; margin-top: 2px; }
    .notif-content { flex: 1; }
    .notif-content strong { font-size: 13px; color: #1e293b; display: block; }
    .notif-content p { font-size: 12px; color: #64748b; margin: 2px 0; }
    .notif-content small { font-size: 11px; color: #94a3b8; }
    .notif-empty { text-align: center; padding: 24px; color: #94a3b8; }
    .notif-empty i { font-size: 24px; margin-bottom: 8px; display: block; color: #22c55e; }
    .notif-empty p { font-size: 13px; }

    .page-content { flex: 1; padding: 24px; }

    .unauthorized-notice {
      flex: 1; display: flex; align-items: center; justify-content: center; padding: 48px;
    }
    .unauth-card {
      text-align: center; background: #fff; border-radius: 20px; padding: 48px;
      border: 1px solid #e2e8f0; max-width: 480px;
    }
    .unauth-card i { font-size: 48px; color: #ef4444; margin-bottom: 16px; }
    .unauth-card h3 { font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 8px; }
    .unauth-card p { font-size: 15px; color: #64748b; margin-bottom: 24px; line-height: 1.6; }
    .btn-primary {
      padding: 12px 24px; background: linear-gradient(135deg, #1e3a8a, #2563eb); color: #fff;
      border: none; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer;
      display: inline-flex; align-items: center; gap: 8px;
    }

    @media (max-width: 768px) {
      .sidebar { transform: translateX(-100%); }
      .sidebar-collapsed .sidebar { transform: translateX(-100%); }
      .main-content, .sidebar-collapsed .main-content { margin-left: 0; }
      .user-info, .role-chip, .status-text { display: none; }
    }
  `]
})
export class MainLayoutComponent implements OnInit {
  sidebarCollapsed = signal(false);
  showNotifications = signal(false);
  showUserMenu = signal(false);
  notifications: Notification[] = [];
  currentRoute = signal('');

  allMenuItems: MenuItem[] = [
    { route: '/dashboard', label: 'Dashboard', icon: 'pi pi-th-large', badge: null, badgeType: '' },
    { route: '/risk-management', label: 'Risk Management', icon: 'pi pi-exclamation-triangle', badge: '5', badgeType: 'danger' },
    { route: '/fraud-detection', label: 'Fraud Detection', icon: 'pi pi-shield', badge: '12', badgeType: 'warning' },
    { route: '/aml-screening', label: 'AML & Sanctions', icon: 'pi pi-globe', badge: '3', badgeType: 'info' },
    { route: '/transaction-monitoring', label: 'Transaction Monitor', icon: 'pi pi-bolt', badge: null, badgeType: '' },
    { route: '/case-management', label: 'Case Management', icon: 'pi pi-briefcase', badge: '8', badgeType: 'warning' },
    { route: '/analytics', label: 'Analytics & Reports', icon: 'pi pi-chart-bar', badge: null, badgeType: '' },
    { route: '/alert-management', label: 'Alert Management', icon: 'pi pi-bell', badge: '23', badgeType: 'danger' },
    { route: '/model-management', label: 'AI/ML Models', icon: 'pi pi-microchip-ai', badge: null, badgeType: '' },
    { route: '/data-governance', label: 'Data Governance', icon: 'pi pi-database', badge: null, badgeType: '' },
    { route: '/compliance', label: 'Compliance & Audit', icon: 'pi pi-verified', badge: null, badgeType: '' },
    { route: '/admin', label: 'Administration', icon: 'pi pi-cog', badge: null, badgeType: '' },
  ];

  // Computed: only show menu items the user's role can access
  visibleMenuItems = computed(() => {
    return this.allMenuItems.filter(item => this.auth.canAccessRoute(item.route));
  });

  // Role-filtered notifications
  roleFilteredNotifications = computed(() => {
    const role = this.auth.userRole();
    if (!role) return [];
    return this.notifications.filter(n => {
      if (!n.link) return true;
      return this.auth.canAccessRoute(n.link);
    });
  });

  globalSearch = '';
  searchResults = signal<{id: string; title: string; subtitle: string; type: string; icon: string; route: string}[]>([]);

  constructor(public auth: AuthService, private mockData: MockDataService, private router: Router) {
    this.notifications = this.mockData.getNotifications();
  }

  onGlobalSearch() {
    const q = this.globalSearch.toLowerCase().trim();
    if (!q || q.length < 2) { this.searchResults.set([]); return; }
    const results: any[] = [];
    // Search risks
    this.mockData.getRisks().filter(r => r.title.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || r.category.toLowerCase().includes(q))
      .slice(0, 3).forEach(r => results.push({ id: r.id, title: r.title, subtitle: `${r.riskLevel} · ${r.category}`, type: 'Risk', icon: 'pi pi-exclamation-triangle', route: '/risk-management' }));
    // Search fraud alerts
    this.mockData.getFraudAlerts().filter(a => a.customerName.toLowerCase().includes(q) || a.id.toLowerCase().includes(q) || a.alertType.toLowerCase().includes(q))
      .slice(0, 3).forEach(a => results.push({ id: a.id, title: `${a.id} - ${a.customerName}`, subtitle: `${a.alertType} · Score: ${a.fraudScore}`, type: 'Alert', icon: 'pi pi-shield', route: '/fraud-detection' }));
    // Search cases
    this.mockData.getCases().filter(c => c.title.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.customerName.toLowerCase().includes(q))
      .slice(0, 3).forEach(c => results.push({ id: c.id, title: c.title, subtitle: `${c.type} · ${c.status}`, type: 'Case', icon: 'pi pi-briefcase', route: '/case-management' }));
    // Search users
    this.mockData.getUsers().filter(u => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.username.toLowerCase().includes(q))
      .slice(0, 2).forEach(u => results.push({ id: u.id, title: u.fullName, subtitle: `${u.role} · ${u.department}`, type: 'User', icon: 'pi pi-user', route: '/admin' }));
    this.searchResults.set(results.slice(0, 8));
  }

  clearSearch() { this.globalSearch = ''; this.searchResults.set([]); }

  ngOnInit() {
    this.router.events.subscribe(() => {
      this.currentRoute.set(this.router.url);
    });
  }

  isUnauthorizedRoute(): boolean {
    const url = this.router.url;
    if (url === '/' || url === '/dashboard') return false;
    return !this.auth.canAccessRoute(url);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  unreadCount() {
    return this.roleFilteredNotifications().filter(n => !n.read).length;
  }

  formatRole(role: string): string {
    return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getRoleBadgeColor(): string {
    const role = this.auth.userRole();
    const map: Record<string, string> = {
      'SYSTEM_ADMIN': 'rgba(239, 68, 68, 0.2)',
      'RISK_MANAGER': 'rgba(245, 158, 11, 0.2)',
      'RISK_ANALYST': 'rgba(234, 179, 8, 0.2)',
      'FRAUD_ANALYST': 'rgba(59, 130, 246, 0.2)',
      'SENIOR_INVESTIGATOR': 'rgba(139, 92, 246, 0.2)',
      'AML_OFFICER': 'rgba(6, 182, 212, 0.2)',
      'COMPLIANCE_OFFICER': 'rgba(34, 197, 94, 0.2)',
      'DATA_ANALYST': 'rgba(168, 85, 247, 0.2)',
      'AUDITOR': 'rgba(107, 114, 128, 0.2)',
      'EXECUTIVE': 'rgba(37, 99, 235, 0.3)',
    };
    return map[role || ''] || 'rgba(100,116,139,0.2)';
  }

  getRoleIcon(): string {
    const role = this.auth.userRole();
    const map: Record<string, string> = {
      'SYSTEM_ADMIN': 'pi pi-cog',
      'RISK_MANAGER': 'pi pi-exclamation-triangle',
      'RISK_ANALYST': 'pi pi-chart-line',
      'FRAUD_ANALYST': 'pi pi-shield',
      'SENIOR_INVESTIGATOR': 'pi pi-search',
      'AML_OFFICER': 'pi pi-globe',
      'COMPLIANCE_OFFICER': 'pi pi-verified',
      'DATA_ANALYST': 'pi pi-chart-bar',
      'AUDITOR': 'pi pi-file',
      'EXECUTIVE': 'pi pi-star',
    };
    return map[role || ''] || 'pi pi-user';
  }

  getNotifColor(type: string): string {
    return { ERROR: '#ef4444', WARNING: '#f59e0b', INFO: '#3b82f6', SUCCESS: '#22c55e' }[type] || '#64748b';
  }

  getTimeAgo(date: Date): string {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (diff < 60) return diff + 'm ago';
    if (diff < 1440) return Math.floor(diff / 60) + 'h ago';
    return Math.floor(diff / 1440) + 'd ago';
  }

  markAllRead() { this.notifications.forEach(n => n.read = true); }
  onLogout() { this.auth.logout(); }
}
