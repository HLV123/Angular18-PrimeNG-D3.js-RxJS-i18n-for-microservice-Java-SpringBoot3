import { Injectable } from '@angular/core';
import { ApiBaseService } from './api-base.service';

@Injectable({ providedIn: 'root' })
export class TransactionApiService extends ApiBaseService {
  private base = '/api/transactions';

  getTransactions(params?: any) { return this.get<any>(this.base, params); }
  getTransactionById(id: string) { return this.get<any>(`${this.base}/${id}`); }

  // Scenarios
  getScenarios(params?: any) { return this.get<any>(`${this.base}/scenarios`, params); }
  createScenario(s: any) { return this.post(`${this.base}/scenarios`, s); }
  updateScenario(id: string, s: any) { return this.put(`${this.base}/scenarios/${id}`, s); }
  toggleScenario(id: string, active: boolean) { return this.post(`${this.base}/scenarios/${id}/toggle`, { active }); }
  testScenario(id: string, params: any) { return this.post(`${this.base}/scenarios/${id}/test`, params); }

  // Behavioral
  getCustomerBehavior(customerId: string) { return this.get<any>(`${this.base}/behavioral/${customerId}`); }
  getAnomalies(params?: any) { return this.get<any>(`${this.base}/behavioral/anomalies`, params); }
  getPeerComparison(customerId: string) { return this.get<any>(`${this.base}/behavioral/${customerId}/peers`); }

  // Network
  getNetworkGraph(params?: any) { return this.get<any>(`${this.base}/network`, params); }
  getCluster(id: string) { return this.get<any>(`${this.base}/network/clusters/${id}`); }
}
