import { Injectable } from '@angular/core';
import { ApiBaseService } from './api-base.service';

@Injectable({ providedIn: 'root' })
export class AmlApiService extends ApiBaseService {
  private base = '/api/aml';

  // AML Alerts
  getAlerts(params?: any) { return this.get<any>(`${this.base}/alerts`, params); }
  getAlertById(id: string) { return this.get<any>(`${this.base}/alerts/${id}`); }
  investigateAlert(id: string, notes: any) { return this.post(`${this.base}/alerts/${id}/investigate`, notes); }
  closeAlert(id: string, decision: any) { return this.post(`${this.base}/alerts/${id}/close`, decision); }
  escalateAlert(id: string) { return this.post(`${this.base}/alerts/${id}/escalate`, {}); }

  // Customer Risk
  getCustomerRisks(params?: any) { return this.get<any>(`${this.base}/customers`, params); }
  getCustomerProfile(id: string) { return this.get<any>(`${this.base}/customers/${id}`); }
  updateCustomerRisk(id: string, assessment: any) { return this.put(`${this.base}/customers/${id}/risk`, assessment); }
  requestEDD(id: string) { return this.post(`${this.base}/customers/${id}/edd`, {}); }
  scheduleReview(id: string, date: string) { return this.post(`${this.base}/customers/${id}/schedule-review`, { date }); }
  bulkRescreen(ids: string[]) { return this.post(`${this.base}/customers/bulk-rescreen`, { ids }); }

  // Sanctions
  screenEntity(entity: any) { return this.post(`${this.base}/sanctions/screen`, entity); }
  getScreeningResults(params?: any) { return this.get<any>(`${this.base}/sanctions/results`, params); }
  resolveMatch(id: string, decision: any) { return this.post(`${this.base}/sanctions/results/${id}/resolve`, decision); }
  getWatchLists() { return this.get<any>(`${this.base}/sanctions/lists`); }
  uploadWatchList(file: File) { const fd = new FormData(); fd.append('file', file); return this.post(`${this.base}/sanctions/lists/upload`, fd); }

  // SAR
  getSARs(params?: any) { return this.get<any>(`${this.base}/sar`, params); }
  getSARById(id: string) { return this.get<any>(`${this.base}/sar/${id}`); }
  createSAR(sar: any) { return this.post(`${this.base}/sar`, sar); }
  updateSAR(id: string, sar: any) { return this.put(`${this.base}/sar/${id}`, sar); }
  submitSAR(id: string) { return this.post(`${this.base}/sar/${id}/submit`, {}); }
  approveSAR(id: string) { return this.post(`${this.base}/sar/${id}/approve`, {}); }
  fileSAR(id: string) { return this.post(`${this.base}/sar/${id}/file`, {}); }
}
