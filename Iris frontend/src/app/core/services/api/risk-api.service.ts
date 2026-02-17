import { Injectable } from '@angular/core';
import { ApiBaseService } from './api-base.service';
import { Risk, RiskAssessment, Control, KRI, ActionPlan } from '../../models';

@Injectable({ providedIn: 'root' })
export class RiskApiService extends ApiBaseService {
  private base = '/api/risks';

  // Risk CRUD
  getRisks(params?: any) { return this.get<any>(this.base, params); }
  getRiskById(id: string) { return this.get<Risk>(`${this.base}/${id}`); }
  createRisk(risk: Partial<Risk>) { return this.post<Risk>(this.base, risk); }
  updateRisk(id: string, risk: Partial<Risk>) { return this.put<Risk>(`${this.base}/${id}`, risk); }
  deleteRisk(id: string) { return this.del(`${this.base}/${id}`); }
  cloneRisk(id: string) { return this.post<Risk>(`${this.base}/${id}/clone`, {}); }

  // Risk Assessment
  getAssessments(riskId: string) { return this.get<RiskAssessment[]>(`${this.base}/${riskId}/assessments`); }
  submitAssessment(riskId: string, data: any) { return this.post(`${this.base}/${riskId}/assessments`, data); }
  approveAssessment(riskId: string, assessmentId: string) { return this.post(`${this.base}/${riskId}/assessments/${assessmentId}/approve`, {}); }
  rejectAssessment(riskId: string, assessmentId: string, reason: string) { return this.post(`${this.base}/${riskId}/assessments/${assessmentId}/reject`, { reason }); }

  // Controls
  getControls(riskId: string) { return this.get<Control[]>(`${this.base}/${riskId}/controls`); }
  addControl(riskId: string, c: Partial<Control>) { return this.post(`${this.base}/${riskId}/controls`, c); }
  updateControl(riskId: string, controlId: string, c: Partial<Control>) { return this.put(`${this.base}/${riskId}/controls/${controlId}`, c); }
  deleteControl(riskId: string, controlId: string) { return this.del(`${this.base}/${riskId}/controls/${controlId}`); }

  // KRIs
  getKRIs(riskId: string) { return this.get<KRI[]>(`${this.base}/${riskId}/kris`); }
  addKRI(riskId: string, k: Partial<KRI>) { return this.post(`${this.base}/${riskId}/kris`, k); }
  updateKRI(riskId: string, kriId: string, k: Partial<KRI>) { return this.put(`${this.base}/${riskId}/kris/${kriId}`, k); }

  // Action Plans
  getActionPlans(riskId: string) { return this.get<ActionPlan[]>(`${this.base}/${riskId}/action-plans`); }
  addActionPlan(riskId: string, a: Partial<ActionPlan>) { return this.post(`${this.base}/${riskId}/action-plans`, a); }
  updateActionPlan(riskId: string, planId: string, a: Partial<ActionPlan>) { return this.put(`${this.base}/${riskId}/action-plans/${planId}`, a); }

  // Documents
  uploadDocument(riskId: string, file: File) { const fd = new FormData(); fd.append('file', file); return this.post(`${this.base}/${riskId}/documents`, fd); }
  getDocuments(riskId: string) { return this.get<any[]>(`${this.base}/${riskId}/documents`); }
  deleteDocument(riskId: string, docId: string) { return this.del(`${this.base}/${riskId}/documents/${docId}`); }

  // History
  getHistory(riskId: string) { return this.get<any[]>(`${this.base}/${riskId}/history`); }

  // Workflow
  submitForReview(riskId: string) { return this.post(`${this.base}/${riskId}/submit`, {}); }
  approve(riskId: string) { return this.post(`${this.base}/${riskId}/approve`, {}); }

  // Reports
  getHeatMapData() { return this.get<any>(`${this.base}/reports/heatmap`); }
  getRiskReport(params?: any) { return this.get<any>(`${this.base}/reports`, params); }
  exportReport(format: string) { return this.get<Blob>(`${this.base}/reports/export?format=${format}`, {}, { responseType: 'blob' }); }

  // Bulk
  bulkDelete(ids: string[]) { return this.post(`${this.base}/bulk-delete`, { ids }); }
  bulkExport(ids: string[], format: string) { return this.post<Blob>(`${this.base}/bulk-export`, { ids, format }, { responseType: 'blob' }); }
}
