# IRIS Platform — Kafka Events

> 20 topics · Confluent Kafka 7.6 · JSON payload · Partitioned by entity ID
>
> Tất cả events đều có base fields: `eventId`, `timestamp`, `source`, `userId`

---

## Base Event Schema

Mọi message trên Kafka đều tuân theo format:

```json
{
  "eventId": "evt-550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-02-18T09:30:00Z",
  "source": "iris-risk-service",
  "userId": "U002",
  "type": "RISK_CREATED",
  "payload": { ... }
}
```

---

## Topic Overview

```
Topic                              Partitions   Producers                Consumers
──────────────────────────────────────────────────────────────────────────────────────
iris.risk.created                  3            risk-service             alert, notification
iris.risk.updated                  3            risk-service             alert, notification
iris.risk.threshold-breached       1            risk-service             alert, notification, compliance

iris.fraud.alert-generated         6            fraud-service            case, alert, notification
iris.fraud.decision-made           3            fraud-service            case, notification, audit
iris.fraud.transaction-blocked     3            fraud-service            transaction, notification

iris.aml.alert-generated           3            aml-service              case, alert, notification
iris.aml.sar-filed                 1            aml-service              compliance, notification, audit

iris.transaction.flagged           6            transaction-service      fraud, aml, alert
iris.transaction.pattern-detected  3            transaction-service      fraud, aml, case, notification

iris.case.created                  3            case-service             notification, audit
iris.case.escalated                3            case-service             notification, admin
iris.case.closed                   3            case-service             notification, audit, report

iris.alert.generated               6            alert-service            notification
iris.alert.assigned                3            alert-service            notification
iris.alert.escalated               3            alert-service            notification, admin

iris.model.drift-detected          1            model-service            notification, admin
iris.model.deployed                1            model-service            notification, audit

iris.notification.send             3            all services             notification-service
iris.audit.event                   3            all services             admin-service
```

---

## 1. Risk Events

### `iris.risk.created`

Khi tạo risk mới.

```json
{
  "eventId": "evt-...",
  "timestamp": "2026-02-18T09:30:00Z",
  "source": "iris-risk-service",
  "userId": "U002",
  "type": "RISK_CREATED",
  "payload": {
    "riskId": "RSK-0046",
    "title": "Cloud Infrastructure Risk",
    "category": "OPERATIONAL",
    "riskLevel": "HIGH",
    "likelihood": 4,
    "impact": 4,
    "inherentScore": 16,
    "owner": "U002",
    "department": "IT"
  }
}
```

### `iris.risk.updated`

Khi cập nhật risk (status, score, owner...).

```json
{
  "type": "RISK_UPDATED",
  "payload": {
    "riskId": "RSK-0001",
    "changes": {
      "status": { "old": "DRAFT", "new": "ACTIVE" },
      "riskLevel": { "old": "MEDIUM", "new": "HIGH" }
    }
  }
}
```

### `iris.risk.threshold-breached`

Khi KRI vượt ngưỡng warning hoặc critical.

```json
{
  "type": "KRI_THRESHOLD_BREACHED",
  "payload": {
    "riskId": "RSK-0003",
    "kriId": "KRI-3-0",
    "kriName": "Transaction Volume",
    "currentValue": 95,
    "threshold": 90,
    "thresholdType": "CRITICAL",
    "unit": "%"
  }
}
```

---

## 2. Fraud Events

### `iris.fraud.alert-generated`

Khi rule engine hoặc ML model phát hiện giao dịch đáng ngờ. Topic có 6 partitions vì volume cao nhất.

```json
{
  "type": "FRAUD_ALERT_GENERATED",
  "payload": {
    "alertId": "FA-00081",
    "transactionId": "TXN-000201",
    "customerId": "CUS-0012",
    "customerName": "Nguyễn Văn A",
    "fraudScore": 850,
    "priority": "HIGH",
    "ruleTriggered": "Velocity Exceeded",
    "amount": 15000.00,
    "currency": "USD",
    "channel": "ONLINE",
    "country": "VN"
  }
}
```

### `iris.fraud.decision-made`

Khi analyst đưa ra quyết định (True Positive / False Positive / Escalate).

```json
{
  "type": "FRAUD_DECISION_MADE",
  "payload": {
    "alertId": "FA-00023",
    "decision": "TRUE_POSITIVE",
    "analystId": "U003",
    "analystName": "Lê Minh Phân Tích",
    "notes": "Confirmed unauthorized access from foreign IP",
    "caseCreated": true,
    "caseId": "CASE-2024036"
  }
}
```

### `iris.fraud.transaction-blocked`

Khi giao dịch bị block real-time.

```json
{
  "type": "TRANSACTION_BLOCKED",
  "payload": {
    "transactionId": "TXN-000201",
    "customerId": "CUS-0012",
    "amount": 15000.00,
    "reason": "Fraud score exceeded threshold (850 > 700)",
    "blockedBy": "SYSTEM",
    "alertId": "FA-00081"
  }
}
```

---

## 3. AML Events

### `iris.aml.alert-generated`

Khi scenario detection phát hiện hoạt động rửa tiền tiềm năng.

```json
{
  "type": "AML_ALERT_GENERATED",
  "payload": {
    "alertId": "AML-00041",
    "customerId": "CUS-0025",
    "customerName": "Công ty Alpha",
    "riskScore": 78,
    "scenario": "Structuring",
    "transactionCount": 12,
    "totalAmount": 89500.00,
    "period": "7_DAYS",
    "priority": "HIGH"
  }
}
```

### `iris.aml.sar-filed`

Khi SAR được file thành công tới cơ quan quản lý.

```json
{
  "type": "SAR_FILED",
  "payload": {
    "sarId": "SAR-2026-043",
    "customerId": "CUS-0025",
    "customerName": "Công ty Alpha",
    "amount": 89500.00,
    "filedBy": "U005",
    "filedTo": "FinCEN",
    "filingDate": "2026-02-18",
    "referenceNumber": "FIN-2026-00043"
  }
}
```

---

## 4. Transaction Events

### `iris.transaction.flagged`

Khi monitoring engine flag giao dịch đáng ngờ. Topic có 6 partitions — volume cao nhất cùng fraud alerts.

```json
{
  "type": "TRANSACTION_FLAGGED",
  "payload": {
    "transactionId": "TXN-000205",
    "customerId": "CUS-0033",
    "amount": 9800.00,
    "currency": "USD",
    "type": "TRANSFER",
    "channel": "ONLINE",
    "fraudScore": 620,
    "scenarioMatched": "SC-001",
    "scenarioName": "High Value International Wire",
    "matchType": "FULL",
    "riskFactors": ["amount_high", "new_beneficiary", "high_risk_country"]
  }
}
```

### `iris.transaction.pattern-detected`

Khi phát hiện pattern bất thường (structuring, round-tripping, layering...).

```json
{
  "type": "PATTERN_DETECTED",
  "payload": {
    "patternId": "PAT-2026-0089",
    "patternType": "STRUCTURING",
    "customerId": "CUS-0033",
    "customerName": "Phạm Thị D",
    "transactionIds": ["TXN-000201", "TXN-000203", "TXN-000205"],
    "totalAmount": 29100.00,
    "description": "3 transactions to same beneficiary in 3 days, all just below $10,000 threshold",
    "severity": "HIGH",
    "confidence": 0.87
  }
}
```

---

## 5. Case Events

### `iris.case.created`

```json
{
  "type": "CASE_CREATED",
  "payload": {
    "caseId": "CASE-2024036",
    "title": "Account Takeover Investigation",
    "type": "ACCOUNT_TAKEOVER",
    "priority": "HIGH",
    "customerId": "CUS-0012",
    "assignedTo": "U003",
    "sourceAlertId": "FA-00023",
    "fraudAmount": 15000.00
  }
}
```

### `iris.case.escalated`

```json
{
  "type": "CASE_ESCALATED",
  "payload": {
    "caseId": "CASE-2024010",
    "escalatedBy": "U003",
    "escalatedTo": "U002",
    "reason": "Complex multi-account fraud ring detected",
    "previousPriority": "MEDIUM",
    "newPriority": "HIGH"
  }
}
```

### `iris.case.closed`

```json
{
  "type": "CASE_CLOSED",
  "payload": {
    "caseId": "CASE-2024010",
    "resolution": "CONFIRMED_FRAUD",
    "closedBy": "U003",
    "fraudAmount": 45000.00,
    "recoveryAmount": 32000.00,
    "lossAmount": 13000.00,
    "duration": 14,
    "durationUnit": "DAYS"
  }
}
```

---

## 6. Alert Events

### `iris.alert.generated`

Alert tổng hợp — có thể từ fraud, AML, risk, hoặc compliance.

```json
{
  "type": "ALERT_GENERATED",
  "payload": {
    "alertId": "ALT-2026-0892",
    "alertType": "FRAUD",
    "source": "RULE",
    "subject": "CUS-0012",
    "subjectType": "CUSTOMER",
    "priority": "HIGH",
    "score": 85,
    "description": "Multiple high-value transactions from new device"
  }
}
```

### `iris.alert.assigned`

```json
{
  "type": "ALERT_ASSIGNED",
  "payload": {
    "alertId": "ALT-2026-0892",
    "assignedTo": "U003",
    "assignedBy": "SYSTEM",
    "assignmentReason": "Auto-routing: Fraud alerts → Fraud Prevention team"
  }
}
```

### `iris.alert.escalated`

```json
{
  "type": "ALERT_ESCALATED",
  "payload": {
    "alertId": "ALT-2026-0892",
    "escalatedBy": "U003",
    "escalatedTo": "U002",
    "reason": "SLA breach - unresolved for 48 hours",
    "triggerPolicy": "ESP-001"
  }
}
```

---

## 7. Model Events

### `iris.model.drift-detected`

Khi model monitoring phát hiện data drift hoặc performance degradation.

```json
{
  "type": "MODEL_DRIFT_DETECTED",
  "payload": {
    "modelId": "MDL-002",
    "modelName": "AML Risk Scoring RF",
    "driftType": "DATA_DRIFT",
    "driftScore": 0.08,
    "threshold": 0.05,
    "affectedFeatures": ["transaction_amount", "country_risk"],
    "currentAccuracy": 0.912,
    "baselineAccuracy": 0.934,
    "recommendation": "RETRAIN"
  }
}
```

### `iris.model.deployed`

```json
{
  "type": "MODEL_DEPLOYED",
  "payload": {
    "modelId": "MDL-004",
    "modelName": "Credit Risk Neural Net",
    "version": "4.0.0",
    "environment": "PRODUCTION",
    "previousVersion": "3.2.1",
    "deployedBy": "U006",
    "accuracy": 0.945,
    "abTestEnabled": true
  }
}
```

---

## 8. Cross-cutting Events

### `iris.notification.send`

Mọi service đều có thể publish event này để gửi notification tới user.

```json
{
  "type": "SEND_NOTIFICATION",
  "payload": {
    "recipientId": "U003",
    "recipientEmail": "fraud@iris.com",
    "title": "New Fraud Alert Assigned",
    "message": "Alert FA-00081 has been assigned to you. Priority: HIGH.",
    "notificationType": "WARNING",
    "channels": ["IN_APP", "EMAIL"],
    "link": "/fraud-detection",
    "icon": "pi pi-shield"
  }
}
```

### `iris.audit.event`

Mọi thao tác CRUD đều publish audit event.

```json
{
  "type": "AUDIT_EVENT",
  "payload": {
    "action": "UPDATE",
    "entityType": "RISK",
    "entityId": "RSK-0001",
    "userId": "U002",
    "userName": "Trần Thị Rủi Ro",
    "ipAddress": "192.168.1.45",
    "changes": {
      "status": { "old": "DRAFT", "new": "ACTIVE" }
    },
    "result": "SUCCESS"
  }
}
```

---

## Event Flow Diagrams

### Fraud Detection Flow

```
Transaction comes in
        │
        ▼
iris.transaction.flagged ──→ fraud-service
        │                         │
        │                    Rule Engine + ML
        │                         │
        │                         ▼
        │              iris.fraud.alert-generated
        │                    │         │
        │                    ▼         ▼
        │              alert-service  notification-service
        │                    │              │
        │                    ▼              ▼
        │              iris.alert.assigned  Push to user
        │                    │
        │                    ▼
        │              Analyst investigates
        │                    │
        │                    ▼
        │              iris.fraud.decision-made
        │                    │         │
        │                    ▼         ▼
        │              case-service   iris.audit.event
        │                    │
        │                    ▼
        │              iris.case.created (if True Positive)
        │
        ▼
iris.fraud.transaction-blocked (if score > threshold)
```

### AML Screening Flow

```
Customer activity
        │
        ▼
iris.transaction.pattern-detected
        │
        ▼
aml-service (scenario matching)
        │
        ▼
iris.aml.alert-generated
        │
        ▼
AML Analyst investigates → Customer 360° → EDD
        │
        ▼
Create SAR (if suspicious)
        │
        ▼
Review → Approve → iris.aml.sar-filed
                         │
                         ▼
               compliance-service (regulatory reporting)
               iris.audit.event
               iris.notification.send
```

---

## Spring Boot Producer Config

```java
@Configuration
public class KafkaConfig {

    @Bean
    public ProducerFactory<String, String> producerFactory() {
        Map<String, Object> config = new HashMap<>();
        config.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        config.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        config.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        config.put(ProducerConfig.ACKS_CONFIG, "all");
        config.put(ProducerConfig.RETRIES_CONFIG, 3);
        return new DefaultKafkaProducerFactory<>(config);
    }

    @Bean
    public KafkaTemplate<String, String> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }
}
```

## Spring Boot Consumer Config

```java
@Configuration
@EnableKafka
public class KafkaConsumerConfig {

    @Bean
    public ConsumerFactory<String, String> consumerFactory() {
        Map<String, Object> config = new HashMap<>();
        config.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        config.put(ConsumerConfig.GROUP_ID_CONFIG, "iris-notification-service");
        config.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        config.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        config.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        return new DefaultKafkaConsumerFactory<>(config);
    }
}
```

## Publish Event Example

```java
@Service
public class RiskEventPublisher {

    private final KafkaTemplate<String, String> kafka;
    private final ObjectMapper mapper;

    public void publishRiskCreated(Risk risk) {
        var event = Map.of(
            "eventId", UUID.randomUUID().toString(),
            "timestamp", Instant.now().toString(),
            "source", "iris-risk-service",
            "type", "RISK_CREATED",
            "payload", Map.of(
                "riskId", risk.getId(),
                "title", risk.getTitle(),
                "category", risk.getCategory(),
                "riskLevel", risk.getRiskLevel()
            )
        );
        kafka.send("iris.risk.created", risk.getId(), mapper.writeValueAsString(event));
    }
}
```

---

## Tổng kết

```
Tổng topics:      20
Tổng partitions:   66
Event types:       20+
Max volume topic:  iris.transaction.flagged (6 partitions)
                   iris.fraud.alert-generated (6 partitions)
                   iris.alert.generated (6 partitions)
Cross-cutting:     iris.notification.send (mọi service → notification)
                   iris.audit.event (mọi service → admin)
```
