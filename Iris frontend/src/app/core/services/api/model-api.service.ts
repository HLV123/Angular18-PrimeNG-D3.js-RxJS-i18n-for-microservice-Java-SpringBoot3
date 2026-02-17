import { Injectable } from '@angular/core';
import { ApiBaseService } from './api-base.service';

@Injectable({ providedIn: 'root' })
export class ModelApiService extends ApiBaseService {
  private base = '/api/models';

  // Catalog
  getModels(params?: any) { return this.get<any>(this.base, params); }
  getModelById(id: string) { return this.get<any>(`${this.base}/${id}`); }
  createModel(m: any) { return this.post(this.base, m); }
  updateModel(id: string, m: any) { return this.put(`${this.base}/${id}`, m); }
  retireModel(id: string) { return this.post(`${this.base}/${id}/retire`, {}); }

  // Development
  trainModel(id: string, config: any) { return this.post(`${this.base}/${id}/train`, config); }
  getTrainingLogs(id: string) { return this.get<any>(`${this.base}/${id}/training-logs`); }
  evaluateModel(id: string) { return this.get<any>(`${this.base}/${id}/evaluation`); }
  compareModels(ids: string[]) { return this.post(`${this.base}/compare`, { ids }); }

  // Deployment
  deployModel(id: string, env: string) { return this.post(`${this.base}/${id}/deploy`, { environment: env }); }
  rollbackModel(id: string) { return this.post(`${this.base}/${id}/rollback`, {}); }
  getDeploymentHistory(id: string) { return this.get<any>(`${this.base}/${id}/deployments`); }
  getABTestResults(id: string) { return this.get<any>(`${this.base}/${id}/ab-test`); }

  // Monitoring
  getModelMetrics(id: string, period?: string) { return this.get<any>(`${this.base}/${id}/metrics`, { period }); }
  getDriftReport(id: string) { return this.get<any>(`${this.base}/${id}/drift`); }
  getFeatureDrift(id: string) { return this.get<any>(`${this.base}/${id}/feature-drift`); }
  getScoreDistribution(id: string) { return this.get<any>(`${this.base}/${id}/score-distribution`); }

  // Explainability
  getFeatureImportance(id: string) { return this.get<any>(`${this.base}/${id}/feature-importance`); }
  getSHAPValues(id: string, predictionId?: string) { return this.get<any>(`${this.base}/${id}/shap`, { predictionId }); }
  getFairnessReport(id: string) { return this.get<any>(`${this.base}/${id}/fairness`); }
  getLocalExplanation(id: string, predictionId: string) { return this.get<any>(`${this.base}/${id}/explain/${predictionId}`); }

  // Governance
  submitForValidation(id: string) { return this.post(`${this.base}/${id}/submit-validation`, {}); }
  approveModel(id: string) { return this.post(`${this.base}/${id}/approve`, {}); }
  getModelDocumentation(id: string) { return this.get<any>(`${this.base}/${id}/documentation`); }
}
