import { Injectable } from '@angular/core';
import { ApiBaseService } from './api-base.service';

@Injectable({ providedIn: 'root' })
export class AdminApiService extends ApiBaseService {
  private base = '/api/admin';

  // Users
  getUsers(params?: any) { return this.get<any>(`${this.base}/users`, params); }
  getUserById(id: string) { return this.get<any>(`${this.base}/users/${id}`); }
  createUser(u: any) { return this.post(`${this.base}/users`, u); }
  updateUser(id: string, u: any) { return this.put(`${this.base}/users/${id}`, u); }
  deleteUser(id: string) { return this.del(`${this.base}/users/${id}`); }
  resetPassword(id: string) { return this.post(`${this.base}/users/${id}/reset-password`, {}); }
  toggleStatus(id: string, status: string) { return this.post(`${this.base}/users/${id}/status`, { status }); }

  // Roles
  getRoles() { return this.get<any>(`${this.base}/roles`); }
  createRole(r: any) { return this.post(`${this.base}/roles`, r); }
  updateRole(id: string, r: any) { return this.put(`${this.base}/roles/${id}`, r); }
  deleteRole(id: string) { return this.del(`${this.base}/roles/${id}`); }
  getPermissions() { return this.get<any>(`${this.base}/permissions`); }
  updateRolePermissions(roleId: string, perms: string[]) { return this.put(`${this.base}/roles/${roleId}/permissions`, { permissions: perms }); }

  // Organization
  getDepartments() { return this.get<any>(`${this.base}/departments`); }
  createDepartment(d: any) { return this.post(`${this.base}/departments`, d); }
  updateDepartment(id: string, d: any) { return this.put(`${this.base}/departments/${id}`, d); }
  getTeams() { return this.get<any>(`${this.base}/teams`); }

  // Audit Log
  getAuditLogs(params?: any) { return this.get<any>(`${this.base}/audit-logs`, params); }
  exportAuditLogs(params?: any) { return this.get<Blob>(`${this.base}/audit-logs/export`, params, { responseType: 'blob' }); }

  // System
  getSystemHealth() { return this.get<any>(`${this.base}/health`); }
  getPerformanceMetrics() { return this.get<any>(`${this.base}/metrics`); }
  getApplicationLogs(params?: any) { return this.get<any>(`${this.base}/logs`, params); }

  // Reference Data
  getCodeTables() { return this.get<any>(`${this.base}/reference-data`); }
  getCodeTable(name: string) { return this.get<any>(`${this.base}/reference-data/${name}`); }
  updateCodeTable(name: string, data: any) { return this.put(`${this.base}/reference-data/${name}`, data); }

  // Notifications
  getNotificationRules() { return this.get<any>(`${this.base}/notification-rules`); }
  createNotificationRule(r: any) { return this.post(`${this.base}/notification-rules`, r); }
  toggleNotificationRule(id: string, active: boolean) { return this.post(`${this.base}/notification-rules/${id}/toggle`, { active }); }

  // Workflows
  getWorkflows() { return this.get<any>(`${this.base}/workflows`); }
  createWorkflow(w: any) { return this.post(`${this.base}/workflows`, w); }
  getWorkflowInstances(params?: any) { return this.get<any>(`${this.base}/workflows/instances`, params); }

  // Backup
  getBackups() { return this.get<any>(`${this.base}/backups`); }
  createBackup() { return this.post(`${this.base}/backups`, {}); }
  restoreBackup(id: string) { return this.post(`${this.base}/backups/${id}/restore`, {}); }

  // Settings
  getSettings() { return this.get<any>(`${this.base}/settings`); }
  updateSettings(s: any) { return this.put(`${this.base}/settings`, s); }
}
