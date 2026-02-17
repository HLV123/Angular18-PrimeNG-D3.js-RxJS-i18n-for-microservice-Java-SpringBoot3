# IRIS Platform — API Contract

> Tài liệu mô tả toàn bộ REST endpoints mà Frontend đã định nghĩa.
> Backend cần implement đúng path, method, request/response format.
>
> Base URL: `http://localhost:8080/api` (qua Gateway)
>
> Tất cả endpoints yêu cầu header: `Authorization: Bearer <jwt-token>`
>
> Response lỗi thống nhất: `{ "message": "...", "code": "...", "timestamp": "..." }`

---

## Pagination chung

Mọi endpoint GET danh sách đều nhận:

```
?page=0&size=10&sort=createdAt,desc&search=keyword
```

Response:

```json
{
  "content": [ ... ],
  "totalElements": 150,
  "totalPages": 15,
  "number": 0,
  "size": 10
}
```

---

## 1. Risk Service — `/api/risks`

| # | Method | Path | Mô tả | Request Body | Response |
|---|--------|------|--------|-------------|----------|
| 1 | GET | `/api/risks` | Danh sách risks (paginated) | — | `Page<Risk>` |
| 2 | GET | `/api/risks/{id}` | Chi tiết 1 risk | — | `Risk` |
| 3 | POST | `/api/risks` | Tạo risk mới | `RiskCreateRequest` | `Risk` |
| 4 | PUT | `/api/risks/{id}` | Cập nhật risk | `RiskUpdateRequest` | `Risk` |
| 5 | DELETE | `/api/risks/{id}` | Xóa risk | — | `204` |
| 6 | POST | `/api/risks/{id}/clone` | Clone risk | — | `Risk` |
| 7 | GET | `/api/risks/{riskId}/assessments` | DS assessments của risk | — | `List<Assessment>` |
| 8 | POST | `/api/risks/{riskId}/assessments` | Tạo assessment | `AssessmentRequest` | `Assessment` |
| 9 | POST | `/api/risks/{riskId}/assessments/{assessmentId}/approve` | Duyệt assessment | — | `Assessment` |
| 10 | POST | `/api/risks/{riskId}/assessments/{assessmentId}/reject` | Từ chối | `{ reason }` | `Assessment` |
| 11 | GET | `/api/risks/{riskId}/controls` | DS controls | — | `List<Control>` |
| 12 | POST | `/api/risks/{riskId}/controls` | Thêm control | `Control` | `Control` |
| 13 | PUT | `/api/risks/{riskId}/controls/{controlId}` | Sửa control | `Control` | `Control` |
| 14 | DELETE | `/api/risks/{riskId}/controls/{controlId}` | Xóa control | — | `204` |
| 15 | GET | `/api/risks/{riskId}/kris` | DS KRIs | — | `List<KRI>` |
| 16 | POST | `/api/risks/{riskId}/kris` | Thêm KRI | `KRI` | `KRI` |
| 17 | PUT | `/api/risks/{riskId}/kris/{kriId}` | Sửa KRI | `KRI` | `KRI` |
| 18 | GET | `/api/risks/{riskId}/action-plans` | DS action plans | — | `List<ActionPlan>` |
| 19 | POST | `/api/risks/{riskId}/action-plans` | Thêm plan | `ActionPlan` | `ActionPlan` |
| 20 | PUT | `/api/risks/{riskId}/action-plans/{planId}` | Sửa plan | `ActionPlan` | `ActionPlan` |
| 21 | POST | `/api/risks/{riskId}/documents` | Upload file | `multipart/form-data` | `Document` |
| 22 | GET | `/api/risks/{riskId}/documents` | DS documents | — | `List<Document>` |
| 23 | DELETE | `/api/risks/{riskId}/documents/{docId}` | Xóa document | — | `204` |
| 24 | GET | `/api/risks/{riskId}/history` | Lịch sử thay đổi | — | `List<History>` |
| 25 | POST | `/api/risks/{riskId}/submit` | Submit for review | — | `Risk` |
| 26 | POST | `/api/risks/{riskId}/approve` | Approve risk | — | `Risk` |
| 27 | GET | `/api/risks/reports/heatmap` | Dữ liệu heatmap | — | `List<HeatMapData>` |
| 28 | GET | `/api/risks/reports` | Report data | `?period=...` | `ReportData` |
| 29 | GET | `/api/risks/reports/export` | Xuất file | `?format=pdf\|excel` | `blob` |
| 30 | POST | `/api/risks/bulk-delete` | Xóa hàng loạt | `{ ids: [] }` | `204` |
| 31 | POST | `/api/risks/bulk-export` | Xuất hàng loạt | `{ ids: [], format }` | `blob` |

---

## 2. Fraud Service — `/api/fraud`

| # | Method | Path | Mô tả | Request Body | Response |
|---|--------|------|--------|-------------|----------|
| 1 | GET | `/api/fraud/alerts` | DS fraud alerts | — | `Page<FraudAlert>` |
| 2 | GET | `/api/fraud/alerts/{id}` | Chi tiết alert | — | `FraudAlert` |
| 3 | POST | `/api/fraud/alerts/{id}/assign` | Gán analyst | `{ userId }` | `FraudAlert` |
| 4 | POST | `/api/fraud/alerts/{id}/close` | Đóng alert | `{ disposition, notes }` | `FraudAlert` |
| 5 | POST | `/api/fraud/alerts/{id}/escalate` | Escalate | — | `FraudAlert` |
| 6 | POST | `/api/fraud/alerts/bulk-assign` | Gán hàng loạt | `{ ids, userId }` | `204` |
| 7 | GET | `/api/fraud/transactions/{id}` | Chi tiết giao dịch | — | `Transaction` |
| 8 | GET | `/api/fraud/transactions/{id}/scoring` | Fraud scoring | — | `FraudScoring` |
| 9 | GET | `/api/fraud/velocity/{customerId}` | Velocity metrics | — | `VelocityMetrics` |
| 10 | POST | `/api/fraud/transactions/{id}/block` | Block giao dịch | — | `Transaction` |
| 11 | POST | `/api/fraud/cards/{cardNumber}/block` | Block thẻ | — | `204` |
| 12 | POST | `/api/fraud/alerts/{alertId}/create-case` | Tạo case từ alert | — | `Case` |
| 13 | POST | `/api/fraud/transactions/{id}/whitelist` | Whitelist giao dịch | — | `204` |
| 14 | GET | `/api/fraud/rules` | DS fraud rules | — | `Page<FraudRule>` |
| 15 | POST | `/api/fraud/rules` | Tạo rule | `FraudRule` | `FraudRule` |
| 16 | PUT | `/api/fraud/rules/{id}` | Sửa rule | `FraudRule` | `FraudRule` |
| 17 | POST | `/api/fraud/rules/{id}/toggle` | Bật/tắt rule | `{ active }` | `FraudRule` |
| 18 | POST | `/api/fraud/rules/{id}/test` | Test rule | `{ params }` | `TestResult` |
| 19 | GET | `/api/fraud/blacklist/{type}` | DS blacklist | — | `Page<Blacklist>` |
| 20 | POST | `/api/fraud/blacklist/{type}` | Thêm vào blacklist | `BlacklistEntry` | `BlacklistEntry` |
| 21 | DELETE | `/api/fraud/blacklist/{type}/{id}` | Xóa khỏi blacklist | — | `204` |
| 22 | GET | `/api/fraud/watchlist` | DS watchlist | — | `Page<Watchlist>` |
| 23 | POST | `/api/fraud/watchlist` | Thêm vào watchlist | `WatchlistEntry` | `WatchlistEntry` |
| 24 | GET | `/api/fraud/dashboard` | Dashboard metrics | — | `FraudDashboard` |
| 25 | GET | `/api/fraud/trends` | Fraud trends | `?period=7d\|30d\|90d` | `List<TrendData>` |

---

## 3. AML Service — `/api/aml`

| # | Method | Path | Mô tả | Request Body | Response |
|---|--------|------|--------|-------------|----------|
| 1 | GET | `/api/aml/alerts` | DS AML alerts | — | `Page<AMLAlert>` |
| 2 | GET | `/api/aml/alerts/{id}` | Chi tiết alert | — | `AMLAlert` |
| 3 | POST | `/api/aml/alerts/{id}/investigate` | Ghi nhận điều tra | `{ notes }` | `AMLAlert` |
| 4 | POST | `/api/aml/alerts/{id}/close` | Đóng alert | `{ decision }` | `AMLAlert` |
| 5 | POST | `/api/aml/alerts/{id}/escalate` | Escalate | — | `AMLAlert` |
| 6 | GET | `/api/aml/customers` | DS khách hàng rủi ro | — | `Page<CustomerRisk>` |
| 7 | GET | `/api/aml/customers/{id}` | Customer profile | — | `CustomerProfile` |
| 8 | PUT | `/api/aml/customers/{id}/risk` | Cập nhật risk score | `{ assessment }` | `CustomerRisk` |
| 9 | POST | `/api/aml/customers/{id}/edd` | Yêu cầu EDD | — | `204` |
| 10 | POST | `/api/aml/customers/{id}/schedule-review` | Đặt lịch review | `{ date }` | `204` |
| 11 | POST | `/api/aml/customers/bulk-rescreen` | Rescreen hàng loạt | `{ ids }` | `204` |
| 12 | POST | `/api/aml/sanctions/screen` | Screen entity | `{ entity }` | `List<SanctionMatch>` |
| 13 | GET | `/api/aml/sanctions/results` | DS kết quả screening | — | `Page<SanctionMatch>` |
| 14 | POST | `/api/aml/sanctions/results/{id}/resolve` | Resolve match | `{ decision }` | `SanctionMatch` |
| 15 | GET | `/api/aml/sanctions/lists` | DS sanction lists | — | `List<WatchList>` |
| 16 | POST | `/api/aml/sanctions/lists/upload` | Upload list mới | `multipart/form-data` | `WatchList` |
| 17 | GET | `/api/aml/sar` | DS SARs | — | `Page<SAR>` |
| 18 | GET | `/api/aml/sar/{id}` | Chi tiết SAR | — | `SAR` |
| 19 | POST | `/api/aml/sar` | Tạo SAR | `SARCreateRequest` | `SAR` |
| 20 | PUT | `/api/aml/sar/{id}` | Cập nhật SAR | `SARUpdateRequest` | `SAR` |
| 21 | POST | `/api/aml/sar/{id}/submit` | Submit SAR | — | `SAR` |
| 22 | POST | `/api/aml/sar/{id}/approve` | Approve SAR | — | `SAR` |
| 23 | POST | `/api/aml/sar/{id}/file` | File SAR to FinCEN | — | `SAR` |

---

## 4. Transaction Service — `/api/transactions`

| # | Method | Path | Mô tả | Request Body | Response |
|---|--------|------|--------|-------------|----------|
| 1 | GET | `/api/transactions` | DS giao dịch | — | `Page<Transaction>` |
| 2 | GET | `/api/transactions/{id}` | Chi tiết giao dịch | — | `Transaction` |
| 3 | GET | `/api/transactions/scenarios` | DS scenarios | — | `Page<Scenario>` |
| 4 | POST | `/api/transactions/scenarios` | Tạo scenario | `Scenario` | `Scenario` |
| 5 | PUT | `/api/transactions/scenarios/{id}` | Sửa scenario | `Scenario` | `Scenario` |
| 6 | POST | `/api/transactions/scenarios/{id}/toggle` | Bật/tắt | `{ active }` | `Scenario` |
| 7 | POST | `/api/transactions/scenarios/{id}/test` | Test scenario | `{ params }` | `TestResult` |
| 8 | GET | `/api/transactions/behavioral/{customerId}` | Behavior profile | — | `BehaviorProfile` |
| 9 | GET | `/api/transactions/behavioral/anomalies` | DS anomalies | — | `Page<Anomaly>` |
| 10 | GET | `/api/transactions/behavioral/{customerId}/peers` | So sánh peer | — | `PeerComparison` |
| 11 | GET | `/api/transactions/network` | Network graph data | — | `NetworkGraph` |
| 12 | GET | `/api/transactions/network/clusters/{id}` | Chi tiết cluster | — | `Cluster` |

---

## 5. Case Service — `/api/cases`

| # | Method | Path | Mô tả | Request Body | Response |
|---|--------|------|--------|-------------|----------|
| 1 | GET | `/api/cases` | DS cases | — | `Page<Case>` |
| 2 | GET | `/api/cases/{id}` | Chi tiết case | — | `Case` |
| 3 | POST | `/api/cases` | Tạo case | `CaseCreateRequest` | `Case` |
| 4 | PUT | `/api/cases/{id}` | Cập nhật case | `CaseUpdateRequest` | `Case` |
| 5 | DELETE | `/api/cases/{id}` | Xóa case | — | `204` |
| 6 | POST | `/api/cases/{id}/assign` | Gán investigator | `{ userId }` | `Case` |
| 7 | POST | `/api/cases/{id}/escalate` | Escalate | — | `Case` |
| 8 | POST | `/api/cases/{id}/close` | Đóng case | `{ resolution }` | `Case` |
| 9 | POST | `/api/cases/{id}/reopen` | Mở lại case | — | `Case` |
| 10 | POST | `/api/cases/{id}/merge` | Gộp case | `{ targetId }` | `Case` |
| 11 | POST | `/api/cases/{id}/split` | Tách case | `{ data }` | `List<Case>` |
| 12 | GET | `/api/cases/{caseId}/tasks` | DS tasks | — | `List<Task>` |
| 13 | POST | `/api/cases/{caseId}/tasks` | Tạo task | `Task` | `Task` |
| 14 | PUT | `/api/cases/{caseId}/tasks/{taskId}` | Sửa task | `Task` | `Task` |
| 15 | POST | `/api/cases/{caseId}/tasks/{taskId}/complete` | Complete task | — | `Task` |
| 16 | GET | `/api/tasks` | DS tất cả tasks | — | `Page<Task>` |
| 17 | GET | `/api/tasks/my` | Tasks của tôi | — | `List<Task>` |
| 18 | POST | `/api/cases/{caseId}/evidence` | Upload evidence | `multipart/form-data` | `Evidence` |
| 19 | GET | `/api/cases/{caseId}/evidence` | DS evidence | — | `List<Evidence>` |
| 20 | DELETE | `/api/cases/{caseId}/evidence/{evidenceId}` | Xóa evidence | — | `204` |
| 21 | GET | `/api/cases/{caseId}/communications` | DS communications | — | `List<Communication>` |
| 22 | POST | `/api/cases/{caseId}/communications` | Gửi communication | `Communication` | `Communication` |
| 23 | GET | `/api/cases/{caseId}/notes` | DS ghi chú | — | `List<CaseNote>` |
| 24 | POST | `/api/cases/{caseId}/notes` | Thêm ghi chú | `CaseNote` | `CaseNote` |
| 25 | GET | `/api/cases/{caseId}/financials` | Financial summary | — | `FinancialSummary` |
| 26 | PUT | `/api/cases/{caseId}/financials` | Cập nhật financials | `FinancialSummary` | `FinancialSummary` |
| 27 | GET | `/api/cases/{caseId}/transactions` | DS giao dịch liên quan | — | `List<Transaction>` |
| 28 | POST | `/api/cases/{caseId}/transactions/{txnId}` | Link giao dịch | — | `204` |
| 29 | GET | `/api/cases/{caseId}/timeline` | Timeline sự kiện | — | `List<TimelineEvent>` |
| 30 | POST | `/api/cases/{caseId}/reports` | Xuất report | `{ template }` | `blob` |
| 31 | GET | `/api/cases/{caseId}/sla` | Thông tin SLA | — | `SLAInfo` |

---

## 6. Alert Service — `/api/alerts`

| # | Method | Path | Mô tả | Request Body | Response |
|---|--------|------|--------|-------------|----------|
| 1 | GET | `/api/alerts` | DS alerts | — | `Page<Alert>` |
| 2 | GET | `/api/alerts/{id}` | Chi tiết alert | — | `Alert` |
| 3 | POST | `/api/alerts/{id}/assign` | Gán analyst | `{ userId }` | `Alert` |
| 4 | POST | `/api/alerts/{id}/escalate` | Escalate | — | `Alert` |
| 5 | POST | `/api/alerts/{id}/close` | Đóng alert | `{ disposition }` | `Alert` |
| 6 | POST | `/api/alerts/{id}/reopen` | Mở lại | — | `Alert` |
| 7 | POST | `/api/alerts/{id}/transfer` | Chuyển alert | `{ target }` | `Alert` |
| 8 | POST | `/api/alerts/{id}/notes` | Thêm note | `{ note }` | `AlertNote` |
| 9 | GET | `/api/alerts/{id}/investigation` | Dữ liệu điều tra | — | `InvestigationData` |
| 10 | POST | `/api/alerts/bulk-assign` | Gán hàng loạt | `{ ids, userId }` | `204` |
| 11 | POST | `/api/alerts/bulk-close` | Đóng hàng loạt | `{ ids, disposition }` | `204` |
| 12 | GET | `/api/alerts/rules` | DS alert rules | — | `List<AlertRule>` |
| 13 | PUT | `/api/alerts/rules/{id}` | Sửa rule | `AlertRule` | `AlertRule` |
| 14 | POST | `/api/alerts/rules/{id}/toggle` | Bật/tắt rule | `{ active }` | `AlertRule` |
| 15 | GET | `/api/alerts/templates` | DS templates | — | `List<Template>` |
| 16 | GET | `/api/alerts/routing` | Routing config | — | `RoutingConfig` |
| 17 | PUT | `/api/alerts/routing` | Sửa routing | `RoutingConfig` | `RoutingConfig` |
| 18 | GET | `/api/alerts/escalation-policies` | DS policies | — | `List<EscalationPolicy>` |
| 19 | GET | `/api/alerts/metrics` | Alert metrics | `?period=...` | `AlertMetrics` |
| 20 | GET | `/api/alerts/analyst-performance` | Performance analysts | — | `List<AnalystPerf>` |
| 21 | GET | `/api/alerts/rule-performance` | Performance rules | — | `List<RulePerf>` |

---

## 7. Model Service — `/api/models`

| # | Method | Path | Mô tả | Request Body | Response |
|---|--------|------|--------|-------------|----------|
| 1 | GET | `/api/models` | DS models | — | `Page<MLModel>` |
| 2 | GET | `/api/models/{id}` | Chi tiết model | — | `MLModel` |
| 3 | POST | `/api/models` | Tạo model | `ModelCreateRequest` | `MLModel` |
| 4 | PUT | `/api/models/{id}` | Cập nhật model | `ModelUpdateRequest` | `MLModel` |
| 5 | POST | `/api/models/{id}/retire` | Retire model | — | `MLModel` |
| 6 | POST | `/api/models/{id}/train` | Train model | `{ config }` | `TrainingJob` |
| 7 | GET | `/api/models/{id}/training-logs` | Logs training | — | `List<TrainingLog>` |
| 8 | GET | `/api/models/{id}/evaluation` | Evaluation report | — | `EvaluationReport` |
| 9 | POST | `/api/models/compare` | So sánh models | `{ ids }` | `ComparisonResult` |
| 10 | POST | `/api/models/{id}/deploy` | Deploy model | `{ environment }` | `Deployment` |
| 11 | POST | `/api/models/{id}/rollback` | Rollback | — | `MLModel` |
| 12 | GET | `/api/models/{id}/deployments` | Lịch sử deploy | — | `List<Deployment>` |
| 13 | GET | `/api/models/{id}/ab-test` | Kết quả A/B test | — | `ABTestResult` |
| 14 | GET | `/api/models/{id}/metrics` | Performance metrics | `?period=...` | `ModelMetrics` |
| 15 | GET | `/api/models/{id}/drift` | Drift report | — | `DriftReport` |
| 16 | GET | `/api/models/{id}/feature-drift` | Feature-level drift | — | `List<FeatureDrift>` |
| 17 | GET | `/api/models/{id}/score-distribution` | Score distribution | — | `Distribution` |
| 18 | GET | `/api/models/{id}/feature-importance` | Feature importance | — | `List<FeatureImportance>` |
| 19 | GET | `/api/models/{id}/shap` | SHAP values | `?predictionId=...` | `SHAPValues` |
| 20 | GET | `/api/models/{id}/fairness` | Fairness report | — | `FairnessReport` |
| 21 | GET | `/api/models/{id}/explain/{predictionId}` | Local explanation | — | `Explanation` |
| 22 | POST | `/api/models/{id}/submit-validation` | Submit for validation | — | `MLModel` |
| 23 | POST | `/api/models/{id}/approve` | Approve model | — | `MLModel` |
| 24 | GET | `/api/models/{id}/documentation` | Model docs | — | `ModelDoc` |

---

## 8. Governance Service — `/api/governance`

| # | Method | Path | Mô tả | Request Body | Response |
|---|--------|------|--------|-------------|----------|
| 1 | GET | `/api/governance/assets` | DS data assets | — | `Page<DataAsset>` |
| 2 | GET | `/api/governance/assets/{id}` | Chi tiết asset | — | `DataAsset` |
| 3 | POST | `/api/governance/assets` | Tạo asset | `DataAsset` | `DataAsset` |
| 4 | PUT | `/api/governance/assets/{id}` | Cập nhật asset | `DataAsset` | `DataAsset` |
| 5 | GET | `/api/governance/assets/{id}/preview` | Preview data | — | `DataPreview` |
| 6 | GET | `/api/governance/assets/{id}/stats` | Statistics | — | `AssetStats` |
| 7 | GET | `/api/governance/lineage/{assetId}` | Lineage 1 asset | — | `LineageGraph` |
| 8 | GET | `/api/governance/lineage` | Full lineage graph | — | `LineageGraph` |
| 9 | GET | `/api/governance/lineage/{assetId}/impact` | Impact analysis | — | `ImpactAnalysis` |
| 10 | GET | `/api/governance/lineage/{assetId}/upstream` | Upstream deps | — | `List<DataAsset>` |
| 11 | GET | `/api/governance/lineage/{assetId}/downstream` | Downstream deps | — | `List<DataAsset>` |
| 12 | GET | `/api/governance/quality` | Quality dashboard | — | `QualityDashboard` |
| 13 | GET | `/api/governance/quality/rules` | DS quality rules | — | `Page<QualityRule>` |
| 14 | POST | `/api/governance/quality/rules` | Tạo quality rule | `QualityRule` | `QualityRule` |
| 15 | POST | `/api/governance/quality/rules/{ruleId}/run` | Chạy rule | — | `QualityResult` |
| 16 | GET | `/api/governance/quality/{assetId}/history` | Quality history | — | `List<QualityHistory>` |
| 17 | GET | `/api/governance/quality/issues` | DS issues | — | `Page<QualityIssue>` |
| 18 | POST | `/api/governance/quality/issues/{issueId}/resolve` | Resolve issue | — | `QualityIssue` |
| 19 | GET | `/api/governance/classification` | DS classifications | — | `List<Classification>` |
| 20 | POST | `/api/governance/classification/{assetId}` | Classify asset | `{ level }` | `Classification` |
| 21 | POST | `/api/governance/classification/{assetId}/scan-pii` | Scan PII | — | `PIIScanResult` |
| 22 | POST | `/api/governance/classification/{assetId}/auto` | Auto classify | — | `Classification` |
| 23 | GET | `/api/governance/access` | DS access policies | — | `Page<AccessPolicy>` |
| 24 | POST | `/api/governance/access` | Tạo policy | `AccessPolicy` | `AccessPolicy` |
| 25 | PUT | `/api/governance/access/{id}` | Sửa policy | `AccessPolicy` | `AccessPolicy` |
| 26 | DELETE | `/api/governance/access/{id}` | Xóa policy | — | `204` |
| 27 | GET | `/api/governance/access/requests` | DS access requests | — | `Page<AccessRequest>` |
| 28 | POST | `/api/governance/access/requests/{id}/approve` | Approve request | — | `AccessRequest` |
| 29 | GET | `/api/governance/access/audit` | Access audit log | — | `Page<AccessAudit>` |
| 30 | GET | `/api/governance/retention` | DS retention policies | — | `List<RetentionPolicy>` |
| 31 | POST | `/api/governance/retention` | Tạo retention policy | `RetentionPolicy` | `RetentionPolicy` |
| 32 | GET | `/api/governance/retention/deletion-requests` | DS deletion requests | — | `List<DeletionRequest>` |
| 33 | POST | `/api/governance/retention/deletion-requests` | Tạo deletion request | `DeletionRequest` | `DeletionRequest` |
| 34 | POST | `/api/governance/retention/deletion-requests/{id}/execute` | Execute deletion | — | `DeletionRequest` |

---

## 9. Compliance Service — `/api/compliance`

| # | Method | Path | Mô tả | Request Body | Response |
|---|--------|------|--------|-------------|----------|
| 1 | GET | `/api/compliance/policies` | DS policies | — | `Page<Policy>` |
| 2 | GET | `/api/compliance/policies/{id}` | Chi tiết policy | — | `Policy` |
| 3 | POST | `/api/compliance/policies` | Tạo policy | `Policy` | `Policy` |
| 4 | PUT | `/api/compliance/policies/{id}` | Sửa policy | `Policy` | `Policy` |
| 5 | POST | `/api/compliance/policies/{id}/submit` | Submit for review | — | `Policy` |
| 6 | POST | `/api/compliance/policies/{id}/approve` | Approve | — | `Policy` |
| 7 | POST | `/api/compliance/policies/{id}/publish` | Publish | — | `Policy` |
| 8 | POST | `/api/compliance/policies/{id}/retire` | Retire | — | `Policy` |
| 9 | GET | `/api/compliance/controls` | DS controls | — | `Page<Control>` |
| 10 | POST | `/api/compliance/controls` | Tạo control | `Control` | `Control` |
| 11 | POST | `/api/compliance/controls/{id}/test` | Test control | `{ result }` | `Control` |
| 12 | GET | `/api/compliance/audits` | DS audits | — | `Page<AuditProject>` |
| 13 | GET | `/api/compliance/audits/{id}` | Chi tiết audit | — | `AuditProject` |
| 14 | POST | `/api/compliance/audits` | Tạo audit | `AuditProject` | `AuditProject` |
| 15 | POST | `/api/compliance/audits/{auditId}/findings` | Thêm finding | `Finding` | `Finding` |
| 16 | PUT | `/api/compliance/audits/{auditId}/findings/{findingId}` | Sửa finding | `Finding` | `Finding` |
| 17 | GET | `/api/compliance/training` | DS courses | — | `Page<Course>` |
| 18 | GET | `/api/compliance/training/status` | Training status | — | `List<TrainingStatus>` |
| 19 | POST | `/api/compliance/training/{courseId}/enroll` | Enroll user | `{ userId }` | `204` |
| 20 | POST | `/api/compliance/training/{courseId}/complete` | Complete training | — | `204` |
| 21 | GET | `/api/compliance/violations` | DS violations | — | `Page<Violation>` |
| 22 | POST | `/api/compliance/violations` | Tạo violation | `Violation` | `Violation` |
| 23 | PUT | `/api/compliance/violations/{id}` | Sửa violation | `Violation` | `Violation` |
| 24 | GET | `/api/compliance/regulatory` | DS regulatory reports | — | `Page<RegReport>` |
| 25 | POST | `/api/compliance/regulatory/generate` | Generate report | `{ template }` | `RegReport` |
| 26 | POST | `/api/compliance/regulatory/{id}/submit` | Submit report | — | `RegReport` |
| 27 | GET | `/api/compliance/attestations/pending` | Pending attestations | — | `List<Attestation>` |
| 28 | POST | `/api/compliance/attestations/{policyId}` | Attest policy | — | `204` |

---

## 10. Admin Service — `/api/admin`

| # | Method | Path | Mô tả | Request Body | Response |
|---|--------|------|--------|-------------|----------|
| 1 | GET | `/api/admin/users` | DS users | — | `Page<User>` |
| 2 | GET | `/api/admin/users/{id}` | Chi tiết user | — | `User` |
| 3 | POST | `/api/admin/users` | Tạo user | `UserCreateRequest` | `User` |
| 4 | PUT | `/api/admin/users/{id}` | Sửa user | `UserUpdateRequest` | `User` |
| 5 | DELETE | `/api/admin/users/{id}` | Xóa user | — | `204` |
| 6 | POST | `/api/admin/users/{id}/reset-password` | Reset password | — | `204` |
| 7 | POST | `/api/admin/users/{id}/status` | Đổi trạng thái | `{ status }` | `User` |
| 8 | GET | `/api/admin/roles` | DS roles | — | `List<Role>` |
| 9 | POST | `/api/admin/roles` | Tạo role | `Role` | `Role` |
| 10 | PUT | `/api/admin/roles/{id}` | Sửa role | `Role` | `Role` |
| 11 | DELETE | `/api/admin/roles/{id}` | Xóa role | — | `204` |
| 12 | GET | `/api/admin/permissions` | DS permissions | — | `List<Permission>` |
| 13 | PUT | `/api/admin/roles/{roleId}/permissions` | Set permissions | `{ permissions }` | `Role` |
| 14 | GET | `/api/admin/departments` | DS departments | — | `List<Department>` |
| 15 | POST | `/api/admin/departments` | Tạo department | `Department` | `Department` |
| 16 | PUT | `/api/admin/departments/{id}` | Sửa department | `Department` | `Department` |
| 17 | GET | `/api/admin/teams` | DS teams | — | `List<Team>` |
| 18 | GET | `/api/admin/audit-logs` | DS audit logs | — | `Page<AuditLog>` |
| 19 | GET | `/api/admin/audit-logs/export` | Export logs | — | `blob` |
| 20 | GET | `/api/admin/health` | System health | — | `List<SystemHealth>` |
| 21 | GET | `/api/admin/metrics` | Performance metrics | — | `Metrics` |
| 22 | GET | `/api/admin/logs` | Application logs | — | `Page<AppLog>` |
| 23 | GET | `/api/admin/reference-data` | DS code tables | — | `List<CodeTable>` |
| 24 | GET | `/api/admin/reference-data/{name}` | Chi tiết 1 table | — | `CodeTable` |
| 25 | PUT | `/api/admin/reference-data/{name}` | Sửa code table | `CodeTable` | `CodeTable` |
| 26 | GET | `/api/admin/notification-rules` | DS notification rules | — | `List<NotifRule>` |
| 27 | POST | `/api/admin/notification-rules` | Tạo rule | `NotifRule` | `NotifRule` |
| 28 | POST | `/api/admin/notification-rules/{id}/toggle` | Bật/tắt | `{ active }` | `NotifRule` |
| 29 | GET | `/api/admin/workflows` | DS workflows | — | `List<Workflow>` |
| 30 | POST | `/api/admin/workflows` | Tạo workflow | `Workflow` | `Workflow` |
| 31 | GET | `/api/admin/workflows/instances` | DS running instances | — | `Page<WorkflowInstance>` |
| 32 | GET | `/api/admin/backups` | DS backups | — | `List<Backup>` |
| 33 | POST | `/api/admin/backups` | Tạo backup | — | `Backup` |
| 34 | POST | `/api/admin/backups/{id}/restore` | Restore backup | — | `204` |
| 35 | GET | `/api/admin/settings` | System settings | — | `Settings` |
| 36 | PUT | `/api/admin/settings` | Cập nhật settings | `Settings` | `Settings` |

---

## 11. Report Service — `/api/reports`

| # | Method | Path | Mô tả | Request Body | Response |
|---|--------|------|--------|-------------|----------|
| 1 | GET | `/api/reports` | DS reports | — | `Page<Report>` |
| 2 | GET | `/api/reports/{id}` | Chi tiết report | — | `Report` |
| 3 | POST | `/api/reports/generate` | Generate report | `{ config }` | `blob` |
| 4 | POST | `/api/reports/schedule` | Tạo schedule | `ScheduleConfig` | `Schedule` |
| 5 | GET | `/api/reports/scheduled` | DS scheduled reports | — | `List<Schedule>` |
| 6 | DELETE | `/api/reports/scheduled/{id}` | Xóa schedule | — | `204` |
| 7 | GET | `/api/reports/history` | Lịch sử generate | — | `Page<ReportHistory>` |
| 8 | GET | `/api/reports/templates` | DS templates | — | `List<Template>` |
| 9 | POST | `/api/reports/templates` | Lưu template | `Template` | `Template` |
| 10 | GET | `/api/reports/dashboards` | DS dashboards | — | `List<Dashboard>` |
| 11 | POST | `/api/reports/dashboards` | Tạo dashboard | `Dashboard` | `Dashboard` |
| 12 | PUT | `/api/reports/dashboards/{id}` | Sửa dashboard | `Dashboard` | `Dashboard` |
| 13 | GET | `/api/reports/{id}/export` | Export report | `?format=pdf\|excel\|csv` | `blob` |

---

## Tổng kết

```
Service              Endpoints
─────────────────────────────
Risk                    31
Fraud                   25
AML                     23
Transaction             12
Case                    31
Alert                   21
Model                   24
Governance              34
Compliance              28
Admin                   36
Report                  13
─────────────────────────────
TOTAL                  278
```
