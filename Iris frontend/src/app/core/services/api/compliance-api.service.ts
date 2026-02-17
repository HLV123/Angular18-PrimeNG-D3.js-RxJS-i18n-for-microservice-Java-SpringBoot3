import { Injectable } from '@angular/core';
import { ApiBaseService } from './api-base.service';

@Injectable({ providedIn: 'root' })
export class ComplianceApiService extends ApiBaseService {
  private base = '/api/compliance';

  // Policies
  getPolicies(params?: any) { return this.get<any>(`${this.base}/policies`, params); }
  getPolicyById(id: string) { return this.get<any>(`${this.base}/policies/${id}`); }
  createPolicy(p: any) { return this.post(`${this.base}/policies`, p); }
  updatePolicy(id: string, p: any) { return this.put(`${this.base}/policies/${id}`, p); }
  submitPolicy(id: string) { return this.post(`${this.base}/policies/${id}/submit`, {}); }
  approvePolicy(id: string) { return this.post(`${this.base}/policies/${id}/approve`, {}); }
  publishPolicy(id: string) { return this.post(`${this.base}/policies/${id}/publish`, {}); }
  retirePolicy(id: string) { return this.post(`${this.base}/policies/${id}/retire`, {}); }

  // Controls
  getControls(params?: any) { return this.get<any>(`${this.base}/controls`, params); }
  createControl(c: any) { return this.post(`${this.base}/controls`, c); }
  testControl(id: string, result: any) { return this.post(`${this.base}/controls/${id}/test`, result); }

  // Audits
  getAudits(params?: any) { return this.get<any>(`${this.base}/audits`, params); }
  getAuditById(id: string) { return this.get<any>(`${this.base}/audits/${id}`); }
  createAudit(a: any) { return this.post(`${this.base}/audits`, a); }
  addFinding(auditId: string, finding: any) { return this.post(`${this.base}/audits/${auditId}/findings`, finding); }
  updateFinding(auditId: string, findingId: string, f: any) { return this.put(`${this.base}/audits/${auditId}/findings/${findingId}`, f); }

  // Training
  getCourses(params?: any) { return this.get<any>(`${this.base}/training`, params); }
  getTrainingStatus(params?: any) { return this.get<any>(`${this.base}/training/status`, params); }
  enrollUser(courseId: string, userId: string) { return this.post(`${this.base}/training/${courseId}/enroll`, { userId }); }
  completeTraining(courseId: string) { return this.post(`${this.base}/training/${courseId}/complete`, {}); }

  // Violations
  getViolations(params?: any) { return this.get<any>(`${this.base}/violations`, params); }
  createViolation(v: any) { return this.post(`${this.base}/violations`, v); }
  updateViolation(id: string, v: any) { return this.put(`${this.base}/violations/${id}`, v); }

  // Regulatory Reporting
  getRegReports(params?: any) { return this.get<any>(`${this.base}/regulatory`, params); }
  generateRegReport(template: string) { return this.post(`${this.base}/regulatory/generate`, { template }); }
  submitRegReport(id: string) { return this.post(`${this.base}/regulatory/${id}/submit`, {}); }

  // Attestation
  getPendingAttestations() { return this.get<any>(`${this.base}/attestations/pending`); }
  attestPolicy(policyId: string) { return this.post(`${this.base}/attestations/${policyId}`, {}); }
}
