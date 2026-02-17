import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./shared/layouts/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'risk-management',
        canActivate: [roleGuard],
        loadComponent: () => import('./features/risk-management/risk-management.component').then(m => m.RiskManagementComponent)
      },
      {
        path: 'fraud-detection',
        canActivate: [roleGuard],
        loadComponent: () => import('./features/fraud-detection/fraud-detection.component').then(m => m.FraudDetectionComponent)
      },
      {
        path: 'aml-screening',
        canActivate: [roleGuard],
        loadComponent: () => import('./features/aml-screening/aml-screening.component').then(m => m.AmlScreeningComponent)
      },
      {
        path: 'transaction-monitoring',
        canActivate: [roleGuard],
        loadComponent: () => import('./features/transaction-monitoring/transaction-monitoring.component').then(m => m.TransactionMonitoringComponent)
      },
      {
        path: 'case-management',
        canActivate: [roleGuard],
        loadComponent: () => import('./features/case-management/case-management.component').then(m => m.CaseManagementComponent)
      },
      {
        path: 'analytics',
        canActivate: [roleGuard],
        loadComponent: () => import('./features/analytics/analytics.component').then(m => m.AnalyticsComponent)
      },
      {
        path: 'alert-management',
        canActivate: [roleGuard],
        loadComponent: () => import('./features/alert-management/alert-management.component').then(m => m.AlertManagementComponent)
      },
      {
        path: 'model-management',
        canActivate: [roleGuard],
        loadComponent: () => import('./features/model-management/model-management.component').then(m => m.ModelManagementComponent)
      },
      {
        path: 'data-governance',
        canActivate: [roleGuard],
        loadComponent: () => import('./features/data-governance/data-governance.component').then(m => m.DataGovernanceComponent)
      },
      {
        path: 'compliance',
        canActivate: [roleGuard],
        loadComponent: () => import('./features/compliance/compliance.component').then(m => m.ComplianceComponent)
      },
      {
        path: 'admin',
        canActivate: [roleGuard],
        loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent)
      },
      {
        path: 'unauthorized',
        loadComponent: () => import('./pages/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  },
  { path: '**', redirectTo: 'login' },
];
