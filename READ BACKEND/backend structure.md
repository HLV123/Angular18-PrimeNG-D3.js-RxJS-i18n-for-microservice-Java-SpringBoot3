# IRIS Platform — Backend Microservices Structure

> Java 17+ · Spring Boot 3 · Spring Cloud · Keycloak · PostgreSQL · Kafka · Redis

---
## Tổng quan kiến trúc

```
                         ┌─────────────────┐
                         │   Angular App    │
                         │  localhost:4200  │
                         └────────┬────────┘
                                  │
                         ┌────────▼────────┐
                         │   API Gateway   │
                         │  localhost:8080  │
                         └────────┬────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │            │            │            │             │
   ┌────▼───┐  ┌────▼───┐  ┌────▼───┐  ┌────▼───┐   ┌────▼───┐
   │  Risk  │  │ Fraud  │  │  AML   │  │  Case  │   │ Admin  │
   │  8081  │  │  8082  │  │  8083  │  │  8084  │   │  8089  │
   └────────┘  └────────┘  └────────┘  └────────┘   └────────┘
        │            │            │            │             │
   ┌────▼───┐  ┌────▼───┐  ┌────▼───┐  ┌────▼───┐   ┌────▼───┐
   │Transact│  │ Alert  │  │ Model  │  │  Gov   │   │Complnc│
   │  8085  │  │  8086  │  │  8087  │  │  8088  │   │  8090  │
   └────────┘  └────────┘  └────────┘  └────────┘   └────────┘
        │            │            │            │             │
        └────────────┴────────────┴────────────┴─────────────┘
                                  │
                    ┌─────────────┼─────────────┐
               ┌────▼───┐   ┌────▼───┐   ┌────▼────┐
               │  Kafka │   │ Redis  │   │Keycloak │
               │  9092  │   │  6379  │   │  8180   │
               └────────┘   └────────┘   └─────────┘
                                  │
                         ┌────────▼────────┐
                         │   PostgreSQL    │
                         │     5432       │
                         └────────────────┘
```

---

## Cấu trúc thư mục tổng

```
iris-backend/
│
├── docker-compose.yml
├── docker-compose.dev.yml
├── pom.xml
├── iris-gateway/
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/
│       └── main/
│           ├── java/com/iris/gateway/
│           │   ├── GatewayApplication.java
│           │   ├── config/
│           │   │   ├── GatewayConfig.java
│           │   │   ├── CorsConfig.java
│           │   │   ├── RateLimitConfig.java
│           │   │   └── SecurityConfig.java
│           │   └── filter/
│           │       ├── AuthenticationFilter.java
│           │       ├── LoggingFilter.java
│           │       └── RateLimitFilter.java
│           └── resources/
│               ├── application.yml
│               └── application-dev.yml
├── iris-discovery/
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/
│       └── main/
│           ├── java/com/iris/discovery/
│           │   └── DiscoveryApplication.java
│           └── resources/
│               └── application.yml
├── iris-config/
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/
│       └── main/
│           ├── java/com/iris/config/
│           │   └── ConfigServerApplication.java
│           └── resources/
│               ├── application.yml
│               └── configurations/
│                   ├── iris-risk-service.yml
│                   ├── iris-fraud-service.yml
│                   ├── iris-aml-service.yml
│                   ├── iris-transaction-service.yml
│                   ├── iris-case-service.yml
│                   ├── iris-alert-service.yml
│                   ├── iris-model-service.yml
│                   ├── iris-governance-service.yml
│                   ├── iris-compliance-service.yml
│                   ├── iris-admin-service.yml
│                   └── iris-report-service.yml
├── iris-common/
│   ├── pom.xml
│   └── src/
│       └── main/
│           └── java/com/iris/common/
│               ├── dto/
│               │   ├── PageResponse.java
│               │   ├── ApiResponse.java
│               │   ├── ErrorResponse.java
│               │   └── FileUploadResponse.java
│               ├── exception/
│               │   ├── BaseException.java
│               │   ├── NotFoundException.java
│               │   ├── ForbiddenException.java
│               │   ├── ValidationException.java
│               │   └── GlobalExceptionHandler.java
│               ├── security/
│               │   ├── JwtUtils.java
│               │   ├── UserContext.java
│               │   └── SecurityConstants.java
│               ├── event/
│               │   ├── BaseEvent.java
│               │   ├── RiskEvent.java
│               │   ├── AlertEvent.java
│               │   ├── CaseEvent.java
│               │   └── NotificationEvent.java
│               ├── audit/
│               │   ├── Auditable.java
│               │   └── AuditEventPublisher.java
│               └── util/
│                   ├── DateUtils.java
│                   ├── JsonUtils.java
│                   └── FileUtils.java
├── iris-risk-service/
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/
│       └── main/
│           ├── java/com/iris/risk/
│           │   ├── RiskServiceApplication.java
│           │   ├── config/
│           │   │   ├── SecurityConfig.java
│           │   │   ├── KafkaConfig.java
│           │   │   └── WebSocketConfig.java
│           │   ├── controller/
│           │   │   ├── RiskController.java
│           │   │   ├── AssessmentController.java
│           │   │   ├── ControlController.java
│           │   │   ├── KRIController.java
│           │   │   ├── ActionPlanController.java
│           │   │   ├── DocumentController.java
│           │   │   └── ReportController.java
│           │   ├── entity/
│           │   │   ├── RiskEntity.java
│           │   │   ├── RiskAssessmentEntity.java
│           │   │   ├── ControlEntity.java
│           │   │   ├── KRIEntity.java
│           │   │   ├── ActionPlanEntity.java
│           │   │   ├── RiskDocumentEntity.java
│           │   │   └── RiskHistoryEntity.java
│           │   ├── dto/
│           │   │   ├── RiskDTO.java
│           │   │   ├── RiskCreateRequest.java
│           │   │   ├── RiskUpdateRequest.java
│           │   │   ├── AssessmentDTO.java
│           │   │   ├── ControlDTO.java
│           │   │   ├── KRIDTO.java
│           │   │   ├── ActionPlanDTO.java
│           │   │   └── HeatMapDataDTO.java
│           │   ├── repository/
│           │   │   ├── RiskRepository.java
│           │   │   ├── AssessmentRepository.java
│           │   │   ├── ControlRepository.java
│           │   │   ├── KRIRepository.java
│           │   │   ├── ActionPlanRepository.java
│           │   │   └── DocumentRepository.java
│           │   ├── service/
│           │   │   ├── RiskService.java
│           │   │   ├── RiskServiceImpl.java
│           │   │   ├── AssessmentService.java
│           │   │   ├── ControlService.java
│           │   │   ├── KRIService.java
│           │   │   ├── RiskReportService.java
│           │   │   └── RiskWorkflowService.java
│           │   ├── mapper/
│           │   │   └── RiskMapper.java
│           │   └── event/
│           │       ├── RiskEventPublisher.java
│           │       └── RiskEventListener.java
│           └── resources/
│               ├── application.yml
│               └── db/
│                   └── migration/
│                       ├── V1__create_risk_tables.sql
│                       └── V2__seed_risk_data.sql
├── iris-fraud-service/
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/
│       └── main/
│           ├── java/com/iris/fraud/
│           │   ├── FraudServiceApplication.java
│           │   ├── config/
│           │   │   ├── SecurityConfig.java
│           │   │   ├── KafkaConfig.java
│           │   │   └── WebSocketConfig.java
│           │   ├── controller/
│           │   │   ├── FraudAlertController.java
│           │   │   ├── FraudRuleController.java
│           │   │   ├── BlacklistController.java
│           │   │   ├── WatchlistController.java
│           │   │   └── FraudDashboardController.java
│           │   ├── entity/
│           │   │   ├── FraudAlertEntity.java
│           │   │   ├── FraudRuleEntity.java
│           │   │   ├── RuleConditionEntity.java
│           │   │   ├── BlacklistEntryEntity.java
│           │   │   ├── WatchlistEntryEntity.java
│           │   │   └── FraudDecisionEntity.java
│           │   ├── dto/
│           │   │   ├── FraudAlertDTO.java
│           │   │   ├── FraudScoringDTO.java
│           │   │   ├── VelocityMetricsDTO.java
│           │   │   ├── Customer360DTO.java
│           │   │   ├── DeviceGeoDTO.java
│           │   │   ├── FraudRuleDTO.java
│           │   │   └── FraudTrendDTO.java
│           │   ├── repository/
│           │   │   ├── FraudAlertRepository.java
│           │   │   ├── FraudRuleRepository.java
│           │   │   ├── BlacklistRepository.java
│           │   │   └── WatchlistRepository.java
│           │   ├── service/
│           │   │   ├── FraudAlertService.java
│           │   │   ├── FraudAlertServiceImpl.java
│           │   │   ├── FraudScoringService.java
│           │   │   ├── FraudRuleEngine.java
│           │   │   ├── VelocityCheckService.java
│           │   │   ├── DeviceAnalysisService.java
│           │   │   └── BlacklistService.java
│           │   ├── mapper/
│           │   │   └── FraudMapper.java
│           │   └── event/
│           │       ├── FraudEventPublisher.java
│           │       └── TransactionEventListener.java
│           └── resources/
│               ├── application.yml
│               └── db/migration/
│                   ├── V1__create_fraud_tables.sql
│                   └── V2__seed_fraud_rules.sql
├── iris-aml-service/
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/
│       └── main/
│           ├── java/com/iris/aml/
│           │   ├── AmlServiceApplication.java
│           │   ├── config/
│           │   │   ├── SecurityConfig.java
│           │   │   └── KafkaConfig.java
│           │   ├── controller/
│           │   │   ├── AmlAlertController.java
│           │   │   ├── CustomerRiskController.java
│           │   │   ├── ScreeningController.java
│           │   │   └── SARController.java
│           │   ├── entity/
│           │   │   ├── AMLAlertEntity.java
│           │   │   ├── CustomerRiskEntity.java
│           │   │   ├── SanctionMatchEntity.java
│           │   │   ├── SAREntity.java
│           │   │   └── WatchListEntity.java
│           │   ├── dto/
│           │   │   ├── AmlAlertDTO.java
│           │   │   ├── CustomerProfileDTO.java
│           │   │   ├── ScreeningResultDTO.java
│           │   │   ├── SARCreateRequest.java
│           │   │   └── TransactionPatternDTO.java
│           │   ├── repository/
│           │   │   ├── AmlAlertRepository.java
│           │   │   ├── CustomerRiskRepository.java
│           │   │   ├── SanctionMatchRepository.java
│           │   │   └── SARRepository.java
│           │   ├── service/
│           │   │   ├── AmlAlertService.java
│           │   │   ├── AmlAlertServiceImpl.java
│           │   │   ├── ScreeningService.java
│           │   │   ├── SanctionListService.java
│           │   │   ├── SARWorkflowService.java
│           │   │   └── CustomerRiskScoringService.java
│           │   ├── mapper/
│           │   │   └── AmlMapper.java
│           │   └── event/
│           │       ├── AmlEventPublisher.java
│           │       └── AmlEventListener.java
│           └── resources/
│               ├── application.yml
│               └── db/migration/
│                   ├── V1__create_aml_tables.sql
│                   └── V2__seed_sanction_lists.sql
├── iris-transaction-service/
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/
│       └── main/
│           ├── java/com/iris/transaction/
│           │   ├── TransactionServiceApplication.java
│           │   ├── config/
│           │   │   ├── SecurityConfig.java
│           │   │   └── KafkaConfig.java
│           │   ├── controller/
│           │   │   ├── TransactionController.java
│           │   │   ├── ScenarioController.java
│           │   │   ├── BehaviorController.java
│           │   │   └── NetworkController.java
│           │   ├── entity/
│           │   │   ├── TransactionEntity.java
│           │   │   ├── ScenarioEntity.java
│           │   │   ├── BehaviorProfileEntity.java
│           │   │   └── PatternDetectionEntity.java
│           │   ├── dto/
│           │   │   ├── TransactionDTO.java
│           │   │   ├── ScenarioDTO.java
│           │   │   ├── BehaviorAnalyticsDTO.java
│           │   │   ├── AnomalyDTO.java
│           │   │   ├── NetworkGraphDTO.java
│           │   │   └── PatternDTO.java
│           │   ├── repository/
│           │   │   ├── TransactionRepository.java
│           │   │   ├── ScenarioRepository.java
│           │   │   └── BehaviorProfileRepository.java
│           │   ├── service/
│           │   │   ├── TransactionService.java
│           │   │   ├── TransactionServiceImpl.java
│           │   │   ├── ScenarioEngine.java
│           │   │   ├── BehaviorAnalyticsService.java
│           │   │   ├── AnomalyDetectionService.java
│           │   │   └── NetworkGraphService.java
│           │   ├── mapper/
│           │   │   └── TransactionMapper.java
│           │   └── event/
│           │       ├── TransactionEventPublisher.java
│           │       └── TransactionStreamListener.java
│           └── resources/
│               ├── application.yml
│               └── db/migration/
│                   ├── V1__create_transaction_tables.sql
│                   └── V2__seed_scenarios.sql
├── iris-case-service/
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/
│       └── main/
│           ├── java/com/iris/casemanagement/
│           │   ├── CaseServiceApplication.java
│           │   ├── config/
│           │   │   ├── SecurityConfig.java
│           │   │   └── KafkaConfig.java
│           │   ├── controller/
│           │   │   ├── CaseController.java
│           │   │   ├── EvidenceController.java
│           │   │   ├── TaskController.java
│           │   │   ├── CommunicationController.java
│           │   │   └── FinancialController.java
│           │   ├── entity/
│           │   │   ├── CaseEntity.java
│           │   │   ├── CaseNoteEntity.java
│           │   │   ├── EvidenceEntity.java
│           │   │   ├── CaseTaskEntity.java
│           │   │   ├── CommunicationEntity.java
│           │   │   ├── FinancialSummaryEntity.java
│           │   │   └── CaseTimelineEntity.java
│           │   ├── dto/
│           │   │   ├── CaseDTO.java
│           │   │   ├── CaseCreateRequest.java
│           │   │   ├── EvidenceDTO.java
│           │   │   ├── TaskDTO.java
│           │   │   ├── CommunicationDTO.java
│           │   │   ├── FinancialSummaryDTO.java
│           │   │   └── TimelineDTO.java
│           │   ├── repository/
│           │   │   ├── CaseRepository.java
│           │   │   ├── CaseNoteRepository.java
│           │   │   ├── EvidenceRepository.java
│           │   │   ├── TaskRepository.java
│           │   │   └── CommunicationRepository.java
│           │   ├── service/
│           │   │   ├── CaseService.java
│           │   │   ├── CaseServiceImpl.java
│           │   │   ├── CaseWorkflowService.java
│           │   │   ├── EvidenceService.java
│           │   │   ├── TaskService.java
│           │   │   └── SLAService.java
│           │   ├── mapper/
│           │   │   └── CaseMapper.java
│           │   └── event/
│           │       ├── CaseEventPublisher.java
│           │       └── CaseEventListener.java
│           └── resources/
│               ├── application.yml
│               └── db/migration/
│                   └── V1__create_case_tables.sql
├── iris-alert-service/
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/
│       └── main/
│           ├── java/com/iris/alert/
│           │   ├── AlertServiceApplication.java
│           │   ├── config/
│           │   │   ├── SecurityConfig.java
│           │   │   └── KafkaConfig.java
│           │   ├── controller/
│           │   │   ├── AlertController.java
│           │   │   ├── AlertRuleController.java
│           │   │   ├── RoutingController.java
│           │   │   └── AlertMetricsController.java
│           │   ├── entity/
│           │   │   ├── AlertEntity.java
│           │   │   ├── AlertRuleEntity.java
│           │   │   ├── AlertNoteEntity.java
│           │   │   ├── RoutingConfigEntity.java
│           │   │   └── EscalationPolicyEntity.java
│           │   ├── dto/
│           │   │   ├── AlertDTO.java
│           │   │   ├── AlertRuleDTO.java
│           │   │   ├── InvestigationDataDTO.java
│           │   │   ├── AnalystPerformanceDTO.java
│           │   │   └── AlertMetricsDTO.java
│           │   ├── repository/
│           │   │   ├── AlertRepository.java
│           │   │   ├── AlertRuleRepository.java
│           │   │   └── RoutingConfigRepository.java
│           │   ├── service/
│           │   │   ├── AlertService.java
│           │   │   ├── AlertServiceImpl.java
│           │   │   ├── AlertRoutingService.java
│           │   │   ├── EscalationService.java
│           │   │   └── AlertMetricsService.java
│           │   ├── mapper/
│           │   │   └── AlertMapper.java
│           │   └── event/
│           │       ├── AlertEventPublisher.java
│           │       └── AlertEventListener.java
│           └── resources/
│               ├── application.yml
│               └── db/migration/
│                   ├── V1__create_alert_tables.sql
│                   └── V2__seed_routing_config.sql
├── iris-model-service/
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/
│       └── main/
│           ├── java/com/iris/model/
│           │   ├── ModelServiceApplication.java
│           │   ├── config/
│           │   │   ├── SecurityConfig.java
│           │   │   └── KafkaConfig.java
│           │   ├── controller/
│           │   │   ├── ModelController.java
│           │   │   ├── ModelMetricsController.java
│           │   │   ├── ExplainabilityController.java
│           │   │   └── GovernanceController.java
│           │   ├── entity/
│           │   │   ├── MLModelEntity.java
│           │   │   ├── ModelVersionEntity.java
│           │   │   ├── ModelMetricsEntity.java
│           │   │   ├── DeploymentHistoryEntity.java
│           │   │   └── ValidationRecordEntity.java
│           │   ├── dto/
│           │   │   ├── ModelDTO.java
│           │   │   ├── ModelMetricsDTO.java
│           │   │   ├── DriftReportDTO.java
│           │   │   ├── SHAPValuesDTO.java
│           │   │   ├── FairnessReportDTO.java
│           │   │   └── GovernanceStatusDTO.java
│           │   ├── repository/
│           │   │   ├── ModelRepository.java
│           │   │   ├── ModelMetricsRepository.java
│           │   │   └── DeploymentHistoryRepository.java
│           │   ├── service/
│           │   │   ├── ModelService.java
│           │   │   ├── ModelServiceImpl.java
│           │   │   ├── ModelTrainingService.java
│           │   │   ├── DriftDetectionService.java
│           │   │   ├── ExplainabilityService.java
│           │   │   └── ModelGovernanceService.java
│           │   ├── mapper/
│           │   │   └── ModelMapper.java
│           │   └── event/
│           │       └── ModelEventPublisher.java
│           └── resources/
│               ├── application.yml
│               └── db/migration/
│                   └── V1__create_model_tables.sql
├── iris-governance-service/
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/
│       └── main/
│           ├── java/com/iris/governance/
│           │   ├── GovernanceServiceApplication.java
│           │   ├── config/
│           │   │   └── SecurityConfig.java
│           │   ├── controller/
│           │   │   ├── DataAssetController.java
│           │   │   ├── LineageController.java
│           │   │   ├── QualityController.java
│           │   │   ├── ClassificationController.java
│           │   │   ├── AccessPolicyController.java
│           │   │   └── RetentionController.java
│           │   ├── entity/
│           │   │   ├── DataAssetEntity.java
│           │   │   ├── DataQualityRuleEntity.java
│           │   │   ├── QualityIssueEntity.java
│           │   │   ├── ClassificationEntity.java
│           │   │   ├── AccessPolicyEntity.java
│           │   │   ├── RetentionPolicyEntity.java
│           │   │   └── LineageEdgeEntity.java
│           │   ├── dto/
│           │   │   ├── DataAssetDTO.java
│           │   │   ├── QualityDashboardDTO.java
│           │   │   ├── LineageDTO.java
│           │   │   ├── ClassificationDTO.java
│           │   │   └── RetentionPolicyDTO.java
│           │   ├── repository/
│           │   │   ├── DataAssetRepository.java
│           │   │   ├── QualityRuleRepository.java
│           │   │   ├── AccessPolicyRepository.java
│           │   │   └── RetentionPolicyRepository.java
│           │   ├── service/
│           │   │   ├── DataAssetService.java
│           │   │   ├── DataAssetServiceImpl.java
│           │   │   ├── DataLineageService.java
│           │   │   ├── DataQualityService.java
│           │   │   ├── ClassificationService.java
│           │   │   ├── PIIScannerService.java
│           │   │   └── RetentionService.java
│           │   └── mapper/
│           │       └── GovernanceMapper.java
│           └── resources/
│               ├── application.yml
│               └── db/migration/
│                   └── V1__create_governance_tables.sql
├── iris-compliance-service/
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/
│       └── main/
│           ├── java/com/iris/compliance/
│           │   ├── ComplianceServiceApplication.java
│           │   ├── config/
│           │   │   └── SecurityConfig.java
│           │   ├── controller/
│           │   │   ├── PolicyController.java
│           │   │   ├── ControlController.java
│           │   │   ├── AuditController.java
│           │   │   ├── TrainingController.java
│           │   │   ├── ViolationController.java
│           │   │   └── RegulatoryController.java
│           │   ├── entity/
│           │   │   ├── PolicyEntity.java
│           │   │   ├── ComplianceControlEntity.java
│           │   │   ├── AuditProjectEntity.java
│           │   │   ├── AuditFindingEntity.java
│           │   │   ├── TrainingCourseEntity.java
│           │   │   ├── TrainingRecordEntity.java
│           │   │   ├── ViolationEntity.java
│           │   │   └── RegulatoryReportEntity.java
│           │   ├── dto/
│           │   │   ├── PolicyDTO.java
│           │   │   ├── ControlDTO.java
│           │   │   ├── AuditDTO.java
│           │   │   ├── FindingDTO.java
│           │   │   ├── ViolationDTO.java
│           │   │   └── RegulatoryReportDTO.java
│           │   ├── repository/
│           │   │   ├── PolicyRepository.java
│           │   │   ├── ControlRepository.java
│           │   │   ├── AuditRepository.java
│           │   │   ├── FindingRepository.java
│           │   │   ├── TrainingRepository.java
│           │   │   └── ViolationRepository.java
│           │   ├── service/
│           │   │   ├── PolicyService.java
│           │   │   ├── PolicyServiceImpl.java
│           │   │   ├── ComplianceControlService.java
│           │   │   ├── AuditService.java
│           │   │   ├── TrainingService.java
│           │   │   ├── ViolationService.java
│           │   │   └── RegulatoryReportService.java
│           │   └── mapper/
│           │       └── ComplianceMapper.java
│           └── resources/
│               ├── application.yml
│               └── db/migration/
│                   ├── V1__create_compliance_tables.sql
│                   └── V2__seed_frameworks.sql
├── iris-admin-service/
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/
│       └── main/
│           ├── java/com/iris/admin/
│           │   ├── AdminServiceApplication.java
│           │   ├── config/
│           │   │   ├── SecurityConfig.java
│           │   │   └── KafkaConfig.java
│           │   ├── controller/
│           │   │   ├── UserController.java
│           │   │   ├── RoleController.java
│           │   │   ├── DepartmentController.java
│           │   │   ├── AuditLogController.java
│           │   │   ├── SystemHealthController.java
│           │   │   ├── CodeTableController.java
│           │   │   ├── NotificationRuleController.java
│           │   │   ├── WorkflowController.java
│           │   │   └── SystemSettingsController.java
│           │   ├── entity/
│           │   │   ├── UserEntity.java
│           │   │   ├── RoleEntity.java
│           │   │   ├── PermissionEntity.java
│           │   │   ├── DepartmentEntity.java
│           │   │   ├── AuditLogEntity.java
│           │   │   ├── CodeTableEntity.java
│           │   │   ├── NotificationRuleEntity.java
│           │   │   ├── WorkflowDefinitionEntity.java
│           │   │   ├── WorkflowInstanceEntity.java
│           │   │   └── SystemSettingEntity.java
│           │   ├── dto/
│           │   │   ├── UserDTO.java
│           │   │   ├── RoleDTO.java
│           │   │   ├── DepartmentDTO.java
│           │   │   ├── AuditLogDTO.java
│           │   │   ├── SystemHealthDTO.java
│           │   │   └── WorkflowDTO.java
│           │   ├── repository/
│           │   │   ├── UserRepository.java
│           │   │   ├── RoleRepository.java
│           │   │   ├── DepartmentRepository.java
│           │   │   ├── AuditLogRepository.java
│           │   │   ├── CodeTableRepository.java
│           │   │   └── WorkflowRepository.java
│           │   ├── service/
│           │   │   ├── UserService.java
│           │   │   ├── UserServiceImpl.java
│           │   │   ├── RoleService.java
│           │   │   ├── AuditLogService.java
│           │   │   ├── SystemHealthService.java
│           │   │   ├── CodeTableService.java
│           │   │   ├── WorkflowService.java
│           │   │   └── BackupService.java
│           │   └── mapper/
│           │       └── AdminMapper.java
│           └── resources/
│               ├── application.yml
│               └── db/migration/
│                   ├── V1__create_admin_tables.sql
│                   ├── V2__seed_roles_permissions.sql
│                   └── V3__seed_code_tables.sql
├── iris-report-service/
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/
│       └── main/
│           ├── java/com/iris/report/
│           │   ├── ReportServiceApplication.java
│           │   ├── config/
│           │   │   └── SecurityConfig.java
│           │   ├── controller/
│           │   │   ├── ReportController.java
│           │   │   ├── ScheduleController.java
│           │   │   ├── TemplateController.java
│           │   │   └── DashboardController.java
│           │   ├── entity/
│           │   │   ├── ReportEntity.java
│           │   │   ├── ReportScheduleEntity.java
│           │   │   ├── ReportTemplateEntity.java
│           │   │   └── DashboardEntity.java
│           │   ├── dto/
│           │   │   ├── ReportDTO.java
│           │   │   ├── ScheduleDTO.java
│           │   │   └── DashboardDTO.java
│           │   ├── repository/
│           │   │   ├── ReportRepository.java
│           │   │   ├── ScheduleRepository.java
│           │   │   └── TemplateRepository.java
│           │   ├── service/
│           │   │   ├── ReportService.java
│           │   │   ├── ReportServiceImpl.java
│           │   │   ├── ReportGeneratorService.java
│           │   │   ├── SchedulerService.java
│           │   │   └── ExportService.java
│           │   └── mapper/
│           │       └── ReportMapper.java
│           └── resources/
│               ├── application.yml
│               └── db/migration/
│                   └── V1__create_report_tables.sql
├── iris-notification-service/
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/
│       └── main/
│           ├── java/com/iris/notification/
│           │   ├── NotificationServiceApplication.java
│           │   ├── config/
│           │   │   ├── KafkaConfig.java
│           │   │   ├── WebSocketConfig.java
│           │   │   └── MailConfig.java
│           │   ├── controller/
│           │   │   └── NotificationController.java
│           │   ├── entity/
│           │   │   └── NotificationEntity.java
│           │   ├── service/
│           │   │   ├── NotificationService.java
│           │   │   ├── EmailService.java
│           │   │   ├── WebSocketPushService.java
│           │   │   └── SMSService.java
│           │   └── event/
│           │       └── NotificationEventListener.java
│           └── resources/
│               └── application.yml
└── infrastructure/
    ├── keycloak/
    │   ├── Dockerfile
    │   └── iris-realm-export.json
    ├── postgres/
    │   └── init-databases.sql
    ├── kafka/
    │   └── create-topics.sh
    └── nginx/
        └── nginx.conf
```

---

## Mapping Frontend → Backend

```
Frontend API Service         →  Backend Microservice         Port    Database
────────────────────────────────────────────────────────────────────────────────
risk-api.service.ts          →  iris-risk-service            8081    iris_risk
fraud-api.service.ts         →  iris-fraud-service           8082    iris_fraud
aml-api.service.ts           →  iris-aml-service             8083    iris_aml
transaction-api.service.ts   →  iris-transaction-service     8085    iris_transaction
case-mgmt-api.service.ts     →  iris-case-service            8084    iris_case
alert-api.service.ts         →  iris-alert-service           8086    iris_alert
model-api.service.ts         →  iris-model-service           8087    iris_model
governance-api.service.ts    →  iris-governance-service      8088    iris_governance
compliance-api.service.ts    →  iris-compliance-service      8090    iris_compliance
admin-api.service.ts         →  iris-admin-service           8089    iris_admin
report-api.service.ts        →  iris-report-service          8091    iris_report
(notification-center)        →  iris-notification-service    8092    iris_notification
────────────────────────────────────────────────────────────────────────────────
                                 iris-gateway                8080    —
                                 iris-discovery              8761    —
                                 iris-config                 8888    —
```