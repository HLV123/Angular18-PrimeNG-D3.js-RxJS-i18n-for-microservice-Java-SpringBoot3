## Tương thích Backend
Project frontend này được thiết kế để kết nối với **Java Spring Boot** backend. 
Hiện tại frontend đang chạy với `MockDataService` (dữ liệu giả trong bộ nhớ). 
Khi có backend thực, chỉ cần sửa một dòng trong `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  useMockData: true,     // ← đổi thành false
  apiUrl: 'http://localhost:8080/api',
  wsUrl: 'ws://localhost:8080/ws',
  keycloak: {
    url: 'http://localhost:8180',
    realm: 'iris',
    clientId: 'iris-frontend'
  }
};
```

### API Endpoints đã định nghĩa
Frontend đã có 12 API service files trong `src/app/core/services/api/`, gọi tới tổng cộng 127 endpoints. 
Backend Spring Boot cần expose đúng các path:

| Service file | Base Path | Các methods gọi |
|---|---|---|
| `risk-api.service.ts` | `/api/risks` | getRisks, getRiskById, createRisk, updateRisk, deleteRisk, cloneRisk, getAssessments, approveAssessment, rejectAssessment, getControls, updateControl, deleteControl, getKRIs, updateKRI, getActionPlans, updateActionPlan, getDocuments, deleteDocument, getHistory, approve, getHeatMapData, getRiskReport, exportReport |
| `fraud-api.service.ts` | `/api/fraud` | getAlerts, getAlertById, assignAlert, escalateAlert, getTransaction, getTransactionScoring, getVelocityMetrics, blockTransaction, blockCard, createCase, getRules, createRule, updateRule, getBlacklist, getWatchlist, getDashboardMetrics, getFraudTrends |
| `aml-api.service.ts` | `/api/aml` | getAlerts, getAlertById, getCustomerRisk, getSanctionMatches, decideSanction, getTransactionPatterns, createSAR, getSARs, submitSAR, getScreeningStats |
| `transaction-api.service.ts` | `/api/transactions` | getTransactions, getTransactionById, getScenarios, getNetworkGraph, flagTransaction, getTransactionScoring, getRelatedTransactions |
| `case-mgmt-api.service.ts` | `/api/cases` | getCases, getCaseById, createCase, updateCase, assignCase, escalateCase, closeCase, addEvidence, getEvidence, addNote, getNotes, getTransactions, getCommunications, getFinancialSummary, getCollaborators |
| `alert-api.service.ts` | `/api/alerts` | getAlerts, getAlertById, assignAlert, investigateAlert, decideAlert, getIndicators, getSubjectDetails, getAlertStats |
| `model-api.service.ts` | `/api/models` | getModels, getModelById, createModel, deployModel, getPerformanceMetrics, getExplainability, getGovernanceStatus, validateModel, getModelDrift, getModelComparison |
| `governance-api.service.ts` | `/api/governance` | getDataAssets, getDataAssetById, createDataAsset, updateDataAsset, getQualityRules, getQualityMetrics, getDataLineage, getClassification, getRetentionPolicies, getAccessLog |
| `compliance-api.service.ts` | `/api/compliance` | getPolicies, getPolicyById, createPolicy, getAuditProjects, getAuditFindings, getControls, getControlEffectiveness, getViolations, createViolation, getRegulatoryReports, getTrainingRecords, getComplianceScore |
| `admin-api.service.ts` | `/api/admin` | getUsers, getUserById, createUser, updateUser, deleteUser, getRoles, getPermissions, updatePermissions, getSessions, revokeSession, getAuditLogs, getSystemHealth, getWorkflows, getReferenceData |
| `report-api.service.ts` | `/api/reports` | getReports, generateReport, getScheduledReports, createSchedule, updateSchedule, deleteSchedule, exportReport |

### TypeScript Interfaces ↔ JPA Entities
Frontend định nghĩa 31 interfaces trong `src/app/core/models/index.ts`. 
Backend cần có JPA entities hoặc DTOs tương ứng, trả JSON đúng field name:

```
Frontend Interface          →  Backend Entity / DTO
─────────────────────────────────────────────────────
User                        →  UserEntity
Risk                        →  RiskEntity
ActionPlan                  →  ActionPlanEntity
Control                     →  ControlEntity
KRI                         →  KRIEntity
RiskAssessment              →  RiskAssessmentEntity
Transaction                 →  TransactionEntity
FraudAlert                  →  FraudAlertEntity
FraudRule                   →  FraudRuleEntity
RuleCondition               →  RuleConditionEntity (embedded)
AMLAlert                    →  AMLAlertEntity
CustomerRisk                →  CustomerRiskEntity
SanctionMatch               →  SanctionMatchEntity
SAR                         →  SAREntity
Case                        →  CaseEntity
CaseNote                    →  CaseNoteEntity
Alert                       →  AlertEntity
MLModel                     →  MLModelEntity
DataAsset                   →  DataAssetEntity
DataQualityRule             →  DataQualityRuleEntity
Policy                      →  PolicyEntity
AuditFinding                →  AuditFindingEntity
AuditProject                →  AuditProjectEntity
AuditLog                    →  AuditLogEntity
Notification                →  NotificationEntity
SystemHealth                →  Spring Actuator /health
HeatMapData                 →  Aggregation DTO
TimeSeriesData              →  Aggregation DTO
GraphNode / GraphLink       →  Graph DTOs
DashboardStats              →  Aggregation DTO
```

### Authentication — Keycloak
Frontend gửi JWT token trong mỗi HTTP request thông qua `auth.interceptor.ts`:

```
Authorization: Bearer <jwt-token>
```
Cấu hình Keycloak mà frontend mong đợi:

```
Keycloak Server  :  http://localhost:8180
Realm            :  iris
Client ID        :  iris-frontend
```
Backend cần cấu hình `spring-boot-starter-oauth2-resource-server` để verify JWT từ Keycloak issuer trên.
Frontend hỗ trợ 9 roles (kiểm tra trong `role.guard.ts` trước mỗi route):

```
ADMIN · RISK_MANAGER · RISK_ANALYST · FRAUD_ANALYST
AML_ANALYST · COMPLIANCE_OFFICER · CASE_INVESTIGATOR
VIEWER · BUSINESS_USER
```
Backend cần trả roles trong JWT realm_access claim.

### HTTP Interceptors — Backend cần gì

| Interceptor | Frontend làm gì | Backend cần |
|---|---|---|
| `auth.interceptor.ts` | Gắn `Bearer token` vào header. Nếu nhận 401 → redirect về `/login` | Trả HTTP 401 khi token hết hạn hoặc không hợp lệ |
| `error.interceptor.ts` | Bắt 400/403/404/500, hiển thị toast message | Trả JSON body: `{ "message": "...", "code": "..." }` |
| `loading.interceptor.ts` | Tự hiện/ẩn loading spinner khi có request đang pending | Không yêu cầu gì |

### File Upload
`file-upload.service.ts` gửi file dạng `multipart/form-data`:

```
POST /api/risks/{id}/documents
Content-Type: multipart/form-data
Body: file=<binary>
```
Backend cần controller nhận `@RequestParam("file") MultipartFile file`.

### WebSocket
`websocket.service.ts` kết nối tới:

```
ws://localhost:8080/ws
```
Dùng cho real-time alerts, transaction feeds, system notifications. 
Backend cần Spring WebSocket (`@EnableWebSocket` hoặc STOMP qua SockJS). 
Frontend tự reconnect khi mất kết nối (retry sau 5 giây).
### Pagination
Mọi API danh sách đều gửi query params theo convention Spring Data:

```
GET /api/risks?page=0&size=10&sort=createdAt,desc&search=keyword
```
Backend dùng Spring Data `Pageable` và trả response:

```json
{
  "content": [ ... ],
  "totalElements": 150,
  "totalPages": 15,
  "number": 0,
  "size": 10
}
```

### CORS
Development: backend cần allow origin `http://localhost:4200`:

```java
@CrossOrigin(origins = "http://localhost:4200")
```
Production: frontend và backend cùng domain, không cần CORS. File `environment.prod.ts` đã dùng relative path `/api` thay vì absolute URL.