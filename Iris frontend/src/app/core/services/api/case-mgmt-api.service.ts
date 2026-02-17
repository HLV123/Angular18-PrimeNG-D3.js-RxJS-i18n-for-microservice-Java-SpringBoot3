import { Injectable } from '@angular/core';
import { ApiBaseService } from './api-base.service';

@Injectable({ providedIn: 'root' })
export class CaseMgmtApiService extends ApiBaseService {
  private base = '/api/cases';

  // Case CRUD
  getCases(params?: any) { return this.get<any>(this.base, params); }
  getCaseById(id: string) { return this.get<any>(`${this.base}/${id}`); }
  createCase(c: any) { return this.post(this.base, c); }
  updateCase(id: string, c: any) { return this.put(`${this.base}/${id}`, c); }
  deleteCase(id: string) { return this.del(`${this.base}/${id}`); }
  assignCase(id: string, userId: string) { return this.post(`${this.base}/${id}/assign`, { userId }); }
  escalateCase(id: string) { return this.post(`${this.base}/${id}/escalate`, {}); }
  closeCase(id: string, resolution: any) { return this.post(`${this.base}/${id}/close`, resolution); }
  reopenCase(id: string) { return this.post(`${this.base}/${id}/reopen`, {}); }
  mergeCase(id: string, targetId: string) { return this.post(`${this.base}/${id}/merge`, { targetId }); }
  splitCase(id: string, data: any) { return this.post(`${this.base}/${id}/split`, data); }

  // Tasks
  getTasks(caseId: string) { return this.get<any>(`${this.base}/${caseId}/tasks`); }
  createTask(caseId: string, task: any) { return this.post(`${this.base}/${caseId}/tasks`, task); }
  updateTask(caseId: string, taskId: string, t: any) { return this.put(`${this.base}/${caseId}/tasks/${taskId}`, t); }
  completeTask(caseId: string, taskId: string) { return this.post(`${this.base}/${caseId}/tasks/${taskId}/complete`, {}); }
  getAllTasks(params?: any) { return this.get<any>('/api/tasks', params); }
  getMyTasks() { return this.get<any>('/api/tasks/my'); }

  // Evidence
  uploadEvidence(caseId: string, file: File, metadata: any) { const fd = new FormData(); fd.append('file', file); fd.append('metadata', JSON.stringify(metadata)); return this.post(`${this.base}/${caseId}/evidence`, fd); }
  getEvidence(caseId: string) { return this.get<any>(`${this.base}/${caseId}/evidence`); }
  deleteEvidence(caseId: string, evidenceId: string) { return this.del(`${this.base}/${caseId}/evidence/${evidenceId}`); }

  // Communications
  getComms(caseId: string) { return this.get<any>(`${this.base}/${caseId}/communications`); }
  addComm(caseId: string, comm: any) { return this.post(`${this.base}/${caseId}/communications`, comm); }

  // Notes
  getNotes(caseId: string) { return this.get<any>(`${this.base}/${caseId}/notes`); }
  addNote(caseId: string, note: any) { return this.post(`${this.base}/${caseId}/notes`, note); }

  // Financial
  getFinancials(caseId: string) { return this.get<any>(`${this.base}/${caseId}/financials`); }
  updateFinancials(caseId: string, data: any) { return this.put(`${this.base}/${caseId}/financials`, data); }

  // Transactions
  getLinkedTransactions(caseId: string) { return this.get<any>(`${this.base}/${caseId}/transactions`); }
  linkTransaction(caseId: string, txnId: string) { return this.post(`${this.base}/${caseId}/transactions/${txnId}`, {}); }

  // Timeline
  getTimeline(caseId: string) { return this.get<any>(`${this.base}/${caseId}/timeline`); }

  // Reports
  generateReport(caseId: string, template: string) { return this.post<Blob>(`${this.base}/${caseId}/reports`, { template }, { responseType: 'blob' }); }

  // SLA
  getSLA(caseId: string) { return this.get<any>(`${this.base}/${caseId}/sla`); }
}
