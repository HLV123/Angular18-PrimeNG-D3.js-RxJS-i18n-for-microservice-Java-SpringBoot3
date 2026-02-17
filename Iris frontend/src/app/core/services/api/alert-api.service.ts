import { Injectable } from '@angular/core';
import { ApiBaseService } from './api-base.service';

@Injectable({ providedIn: 'root' })
export class AlertApiService extends ApiBaseService {
  private base = '/api/alerts';

  getAlerts(params?: any) { return this.get<any>(this.base, params); }
  getAlertById(id: string) { return this.get<any>(`${this.base}/${id}`); }
  assignAlert(id: string, userId: string) { return this.post(`${this.base}/${id}/assign`, { userId }); }
  escalateAlert(id: string) { return this.post(`${this.base}/${id}/escalate`, {}); }
  closeAlert(id: string, disposition: any) { return this.post(`${this.base}/${id}/close`, disposition); }
  reopenAlert(id: string) { return this.post(`${this.base}/${id}/reopen`, {}); }
  transferAlert(id: string, target: string) { return this.post(`${this.base}/${id}/transfer`, { target }); }
  addNote(id: string, note: any) { return this.post(`${this.base}/${id}/notes`, note); }
  getInvestigationData(id: string) { return this.get<any>(`${this.base}/${id}/investigation`); }
  bulkAssign(ids: string[], userId: string) { return this.post(`${this.base}/bulk-assign`, { ids, userId }); }
  bulkClose(ids: string[], disposition: any) { return this.post(`${this.base}/bulk-close`, { ids, ...disposition }); }

  // Configuration
  getAlertRules() { return this.get<any>(`${this.base}/rules`); }
  updateAlertRule(id: string, rule: any) { return this.put(`${this.base}/rules/${id}`, rule); }
  toggleAlertRule(id: string, active: boolean) { return this.post(`${this.base}/rules/${id}/toggle`, { active }); }
  getAlertTemplates() { return this.get<any>(`${this.base}/templates`); }
  getRoutingConfig() { return this.get<any>(`${this.base}/routing`); }
  updateRoutingConfig(config: any) { return this.put(`${this.base}/routing`, config); }
  getEscalationPolicies() { return this.get<any>(`${this.base}/escalation-policies`); }

  // Analytics
  getAlertMetrics(params?: any) { return this.get<any>(`${this.base}/metrics`, params); }
  getAnalystPerformance() { return this.get<any>(`${this.base}/analyst-performance`); }
  getRulePerformance() { return this.get<any>(`${this.base}/rule-performance`); }
}
