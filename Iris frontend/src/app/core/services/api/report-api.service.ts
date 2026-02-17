import { Injectable } from '@angular/core';
import { ApiBaseService } from './api-base.service';

@Injectable({ providedIn: 'root' })
export class ReportApiService extends ApiBaseService {
  private base = '/api/reports';

  getReports(params?: any) { return this.get<any>(this.base, params); }
  getReportById(id: string) { return this.get<any>(`${this.base}/${id}`); }
  generateReport(config: any) { return this.post<Blob>(`${this.base}/generate`, config, { responseType: 'blob' }); }
  scheduleReport(config: any) { return this.post(`${this.base}/schedule`, config); }
  getScheduledReports() { return this.get<any>(`${this.base}/scheduled`); }
  deleteSchedule(id: string) { return this.del(`${this.base}/scheduled/${id}`); }
  getReportHistory() { return this.get<any>(`${this.base}/history`); }
  getReportTemplates() { return this.get<any>(`${this.base}/templates`); }
  saveTemplate(t: any) { return this.post(`${this.base}/templates`, t); }
  getDashboards() { return this.get<any>(`${this.base}/dashboards`); }
  saveDashboard(d: any) { return this.post(`${this.base}/dashboards`, d); }
  updateDashboard(id: string, d: any) { return this.put(`${this.base}/dashboards/${id}`, d); }
  exportReport(id: string, format: string) { return this.get<Blob>(`${this.base}/${id}/export?format=${format}`, {}, { responseType: 'blob' }); }
}
