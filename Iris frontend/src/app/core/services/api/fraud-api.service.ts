import { Injectable } from '@angular/core';
import { ApiBaseService } from './api-base.service';

@Injectable({ providedIn: 'root' })
export class FraudApiService extends ApiBaseService {
  private base = '/api/fraud';

  // Alerts
  getAlerts(params?: any) { return this.get<any>(`${this.base}/alerts`, params); }
  getAlertById(id: string) { return this.get<any>(`${this.base}/alerts/${id}`); }
  assignAlert(id: string, userId: string) { return this.post(`${this.base}/alerts/${id}/assign`, { userId }); }
  closeAlert(id: string, disposition: any) { return this.post(`${this.base}/alerts/${id}/close`, disposition); }
  escalateAlert(id: string) { return this.post(`${this.base}/alerts/${id}/escalate`, {}); }
  bulkAssign(ids: string[], userId: string) { return this.post(`${this.base}/alerts/bulk-assign`, { ids, userId }); }

  // Transaction detail
  getTransaction(id: string) { return this.get<any>(`${this.base}/transactions/${id}`); }
  getTransactionScoring(id: string) { return this.get<any>(`${this.base}/transactions/${id}/scoring`); }
  getVelocityMetrics(customerId: string) { return this.get<any>(`${this.base}/velocity/${customerId}`); }
  blockTransaction(id: string) { return this.post(`${this.base}/transactions/${id}/block`, {}); }
  blockCard(cardNumber: string) { return this.post(`${this.base}/cards/${cardNumber}/block`, {}); }
  createCase(alertId: string) { return this.post(`${this.base}/alerts/${alertId}/create-case`, {}); }
  whitelistTransaction(id: string) { return this.post(`${this.base}/transactions/${id}/whitelist`, {}); }

  // Rules
  getRules(params?: any) { return this.get<any>(`${this.base}/rules`, params); }
  createRule(rule: any) { return this.post(`${this.base}/rules`, rule); }
  updateRule(id: string, rule: any) { return this.put(`${this.base}/rules/${id}`, rule); }
  toggleRule(id: string, active: boolean) { return this.post(`${this.base}/rules/${id}/toggle`, { active }); }
  testRule(id: string, params: any) { return this.post(`${this.base}/rules/${id}/test`, params); }

  // Blacklist/Watchlist
  getBlacklist(type: string, params?: any) { return this.get<any>(`${this.base}/blacklist/${type}`, params); }
  addToBlacklist(type: string, entry: any) { return this.post(`${this.base}/blacklist/${type}`, entry); }
  removeFromBlacklist(type: string, id: string) { return this.del(`${this.base}/blacklist/${type}/${id}`); }
  getWatchlist(params?: any) { return this.get<any>(`${this.base}/watchlist`, params); }
  addToWatchlist(entry: any) { return this.post(`${this.base}/watchlist`, entry); }

  // Dashboard
  getDashboardMetrics() { return this.get<any>(`${this.base}/dashboard`); }
  getFraudTrends(period: string) { return this.get<any>(`${this.base}/trends?period=${period}`); }
}
