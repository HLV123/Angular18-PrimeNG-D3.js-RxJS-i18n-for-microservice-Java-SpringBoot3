import { Injectable } from '@angular/core';
import { ApiBaseService } from './api-base.service';

@Injectable({ providedIn: 'root' })
export class GovernanceApiService extends ApiBaseService {
  private base = '/api/governance';

  // Data Catalog
  getDataAssets(params?: any) { return this.get<any>(`${this.base}/assets`, params); }
  getAssetById(id: string) { return this.get<any>(`${this.base}/assets/${id}`); }
  createAsset(a: any) { return this.post(`${this.base}/assets`, a); }
  updateAsset(id: string, a: any) { return this.put(`${this.base}/assets/${id}`, a); }
  getAssetPreview(id: string) { return this.get<any>(`${this.base}/assets/${id}/preview`); }
  getAssetStatistics(id: string) { return this.get<any>(`${this.base}/assets/${id}/stats`); }

  // Lineage (Atlas)
  getLineage(assetId: string) { return this.get<any>(`${this.base}/lineage/${assetId}`); }
  getFullLineage() { return this.get<any>(`${this.base}/lineage`); }
  getImpactAnalysis(assetId: string) { return this.get<any>(`${this.base}/lineage/${assetId}/impact`); }
  getUpstream(assetId: string) { return this.get<any>(`${this.base}/lineage/${assetId}/upstream`); }
  getDownstream(assetId: string) { return this.get<any>(`${this.base}/lineage/${assetId}/downstream`); }

  // Quality
  getQualityDashboard() { return this.get<any>(`${this.base}/quality`); }
  getQualityRules(params?: any) { return this.get<any>(`${this.base}/quality/rules`, params); }
  createQualityRule(r: any) { return this.post(`${this.base}/quality/rules`, r); }
  runQualityCheck(ruleId: string) { return this.post(`${this.base}/quality/rules/${ruleId}/run`, {}); }
  getQualityHistory(assetId: string) { return this.get<any>(`${this.base}/quality/${assetId}/history`); }
  getQualityIssues(params?: any) { return this.get<any>(`${this.base}/quality/issues`, params); }
  resolveIssue(issueId: string) { return this.post(`${this.base}/quality/issues/${issueId}/resolve`, {}); }

  // Classification
  getClassifications() { return this.get<any>(`${this.base}/classification`); }
  classifyAsset(assetId: string, level: string) { return this.post(`${this.base}/classification/${assetId}`, { level }); }
  scanForPII(assetId: string) { return this.post(`${this.base}/classification/${assetId}/scan-pii`, {}); }
  autoClassify(assetId: string) { return this.post(`${this.base}/classification/${assetId}/auto`, {}); }

  // Access Control (Ranger)
  getAccessPolicies(params?: any) { return this.get<any>(`${this.base}/access`, params); }
  createAccessPolicy(p: any) { return this.post(`${this.base}/access`, p); }
  updateAccessPolicy(id: string, p: any) { return this.put(`${this.base}/access/${id}`, p); }
  deleteAccessPolicy(id: string) { return this.del(`${this.base}/access/${id}`); }
  getAccessRequests(params?: any) { return this.get<any>(`${this.base}/access/requests`, params); }
  approveAccessRequest(id: string) { return this.post(`${this.base}/access/requests/${id}/approve`, {}); }
  getAccessAudit(params?: any) { return this.get<any>(`${this.base}/access/audit`, params); }

  // Retention
  getRetentionPolicies() { return this.get<any>(`${this.base}/retention`); }
  createRetentionPolicy(p: any) { return this.post(`${this.base}/retention`, p); }
  getDeletionRequests() { return this.get<any>(`${this.base}/retention/deletion-requests`); }
  createDeletionRequest(r: any) { return this.post(`${this.base}/retention/deletion-requests`, r); }
  executeDeletion(id: string) { return this.post(`${this.base}/retention/deletion-requests/${id}/execute`, {}); }
}
