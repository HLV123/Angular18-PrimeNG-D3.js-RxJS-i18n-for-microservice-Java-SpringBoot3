import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserRole } from '../models';
import { MockDataService } from '../services/mock-data.service';
import { environment } from '../../../environments/environment';

export interface MenuPermission {
  route: string;
  roles: UserRole[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser = signal<User | null>(null);
  private token = signal<string | null>(null);

  user = this.currentUser.asReadonly();
  isAuthenticated = computed(() => !!this.currentUser());
  userRole = computed(() => this.currentUser()?.role);
  userRoles = computed(() => this.currentUser()?.roles || []);

  static readonly MODULE_PERMISSIONS: MenuPermission[] = [
    { route: '/dashboard', roles: [UserRole.SYSTEM_ADMIN, UserRole.RISK_MANAGER, UserRole.RISK_ANALYST, UserRole.FRAUD_ANALYST, UserRole.SENIOR_INVESTIGATOR, UserRole.AML_OFFICER, UserRole.COMPLIANCE_OFFICER, UserRole.DATA_ANALYST, UserRole.AUDITOR, UserRole.EXECUTIVE, UserRole.BUSINESS_USER] },
    { route: '/risk-management', roles: [UserRole.SYSTEM_ADMIN, UserRole.RISK_MANAGER, UserRole.RISK_ANALYST, UserRole.EXECUTIVE, UserRole.AUDITOR] },
    { route: '/fraud-detection', roles: [UserRole.SYSTEM_ADMIN, UserRole.FRAUD_ANALYST, UserRole.SENIOR_INVESTIGATOR, UserRole.EXECUTIVE] },
    { route: '/aml-screening', roles: [UserRole.SYSTEM_ADMIN, UserRole.AML_OFFICER, UserRole.COMPLIANCE_OFFICER, UserRole.EXECUTIVE] },
    { route: '/transaction-monitoring', roles: [UserRole.SYSTEM_ADMIN, UserRole.FRAUD_ANALYST, UserRole.SENIOR_INVESTIGATOR, UserRole.AML_OFFICER, UserRole.DATA_ANALYST] },
    { route: '/case-management', roles: [UserRole.SYSTEM_ADMIN, UserRole.FRAUD_ANALYST, UserRole.SENIOR_INVESTIGATOR, UserRole.AML_OFFICER, UserRole.COMPLIANCE_OFFICER] },
    { route: '/analytics', roles: [UserRole.SYSTEM_ADMIN, UserRole.DATA_ANALYST, UserRole.RISK_MANAGER, UserRole.EXECUTIVE, UserRole.AUDITOR] },
    { route: '/alert-management', roles: [UserRole.SYSTEM_ADMIN, UserRole.FRAUD_ANALYST, UserRole.SENIOR_INVESTIGATOR, UserRole.AML_OFFICER, UserRole.RISK_ANALYST] },
    { route: '/model-management', roles: [UserRole.SYSTEM_ADMIN, UserRole.DATA_ANALYST] },
    { route: '/data-governance', roles: [UserRole.SYSTEM_ADMIN, UserRole.DATA_ANALYST, UserRole.COMPLIANCE_OFFICER] },
    { route: '/compliance', roles: [UserRole.SYSTEM_ADMIN, UserRole.COMPLIANCE_OFFICER, UserRole.AUDITOR, UserRole.EXECUTIVE] },
    { route: '/admin', roles: [UserRole.SYSTEM_ADMIN] },
  ];

  constructor(private router: Router, private mockData: MockDataService) {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem('iris_user');
    const storedToken = localStorage.getItem('iris_token');
    if (stored && storedToken) {
      try {
        this.currentUser.set(JSON.parse(stored));
        this.token.set(storedToken);
      } catch { this.logout(); }
    }
  }

  login(username: string, password: string): boolean {
    if (environment.useMockData) {
      const user = this.mockData.authenticate(username, password);
      if (user) {
        const mockToken = btoa(JSON.stringify({ sub: user.id, username: user.username, roles: user.roles, exp: Date.now() + 86400000 }));
        this.currentUser.set(user);
        this.token.set(mockToken);
        localStorage.setItem('iris_user', JSON.stringify(user));
        localStorage.setItem('iris_token', mockToken);
        return true;
      }
      return false;
    }
    return false;
  }

  logout(): void {
    this.currentUser.set(null);
    this.token.set(null);
    localStorage.removeItem('iris_user');
    localStorage.removeItem('iris_token');
    this.router.navigate(['/login']);
  }

  getToken(): string | null { return this.token(); }

  canAccessRoute(route: string): boolean {
    const user = this.currentUser();
    if (!user) return false;
    if (user.roles.includes(UserRole.SYSTEM_ADMIN)) return true;
    const perm = AuthService.MODULE_PERMISSIONS.find(p => route.startsWith(p.route));
    if (!perm) return true;
    return user.roles.some(r => perm.roles.includes(r));
  }

  getAccessibleRoutes(): string[] {
    const user = this.currentUser();
    if (!user) return [];
    return AuthService.MODULE_PERMISSIONS.filter(p => user.roles.some(r => p.roles.includes(r))).map(p => p.route);
  }

  hasRole(...roles: UserRole[]): boolean {
    const user = this.currentUser();
    return user?.roles.some(r => roles.includes(r)) || false;
  }

  isAdmin(): boolean { return this.hasRole(UserRole.SYSTEM_ADMIN); }

  hasPermission(permission: string): boolean {
    const user = this.currentUser();
    if (!user) return false;
    if (user.permissions.includes('*')) return true;
    return user.permissions.some(p => p.endsWith('.*') ? permission.startsWith(p.replace('.*', '')) : p === permission);
  }

  getAvailableCredentials() { return this.mockData.getCredentialsList(); }
}
