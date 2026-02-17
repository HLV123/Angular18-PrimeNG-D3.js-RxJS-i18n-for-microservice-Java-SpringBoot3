# IRIS Platform — Mock Data

> Dữ liệu giả được sinh bởi `src/app/core/services/mock-data.service.ts` (558 lines)
>
> Khi `environment.useMockData = true`, toàn bộ API calls sẽ trả dữ liệu từ file này

---

## Tài khoản đăng nhập

| Username | Password | Role | Họ tên | Phòng ban |
|----------|----------|------|--------|-----------|
| `admin` | `admin123` | SYSTEM_ADMIN | Nguyễn Văn Admin | IT |
| `riskmanager` | `risk123` | RISK_MANAGER | Trần Thị Rủi Ro | Risk Management |
| `fraudanalyst` | `fraud123` | FRAUD_ANALYST | Lê Minh Phân Tích | Fraud Prevention |
| `compliance` | `comp123` | COMPLIANCE_OFFICER | Phạm Hồng Tuân Thủ | Compliance |
| `amlofficer` | `aml123` | AML_OFFICER | Hoàng Minh AML | AML |
| `dataanalyst` | `data123` | DATA_ANALYST | Vũ Thị Dữ Liệu | Data Analytics |
| `auditor` | `audit123` | AUDITOR | Đỗ Văn Kiểm Toán | Internal Audit |
| `executive` | `exec123` | EXECUTIVE | Bùi Đức Lãnh Đạo | Executive |

> **Lưu ý:** Ở chế độ mock, nhập bất kỳ email/password nào cũng đăng nhập được. Các tài khoản trên chỉ áp dụng khi có backend thật.

---

## Dữ liệu theo module

### Risks — 45 bản ghi

```
ID format:     RSK-0001 → RSK-0045
Categories:    STRATEGIC, FINANCIAL, OPERATIONAL, COMPLIANCE, REPUTATIONAL
Departments:   Finance, IT, Operations, Sales, HR, Legal, Marketing
Statuses:      40 ACTIVE, 5 ngẫu nhiên (DRAFT/CLOSED/RETIRED)
Likelihood:    1-5 (ngẫu nhiên)
Impact:        1-5 (ngẫu nhiên)
Score:         likelihood × impact (1-25)
Risk Level:    ≥20 CRITICAL, ≥12 HIGH, ≥6 MEDIUM, <6 LOW
```

Mỗi risk kèm:
- 1-3 Action Plans (status: NOT_STARTED / IN_PROGRESS / COMPLETED / OVERDUE)
- 1-3 Controls (type: PREVENTIVE / DETECTIVE / CORRECTIVE, effectiveness 50-100%)
- 1-2 KRIs (warning threshold 70, critical 90, 12 tháng history)

45 titles thực tế:

```
Cybersecurity Breach Risk          Market Volatility Exposure
Regulatory Non-Compliance          Data Privacy Violation
Operational System Failure         Credit Default Risk
Liquidity Crisis                   Vendor Dependency Risk
Fraud Scheme Exposure              Reputational Damage
Interest Rate Risk                 Foreign Exchange Risk
Technology Obsolescence            Talent Retention Risk
Business Continuity Risk           Anti-Money Laundering Gap
Insider Threat Risk                Supply Chain Disruption
Geopolitical Risk                  Climate Change Impact
Digital Transformation Risk        Third-Party API Failure
Social Engineering Attack          Ransomware Threat
Patent Infringement Risk           Customer Attrition Risk
Pricing Model Risk                 Derivative Exposure
Cloud Infrastructure Risk          AI/ML Model Bias
Sanctions Violation Risk           Tax Compliance Risk
Data Quality Degradation           Network Outage Risk
Payment Processing Failure         Cross-Border Transaction Risk
Employee Misconduct                Product Liability Risk
Environmental Compliance           Mergers & Acquisitions Risk
Strategic Misalignment             Capital Adequacy Risk
Counterparty Default               Model Validation Gap
Audit Finding Exposure
```

---

### Transactions — 200 bản ghi

```
ID format:     TXN-000001 → TXN-000200
Amount:        $10 → $50,000 (ngẫu nhiên)
Currency:      USD
Types:         PURCHASE, TRANSFER, WITHDRAWAL, DEPOSIT, PAYMENT
Channels:      ATM, POS, ONLINE, MOBILE, BRANCH
Fraud Score:   0-1000
Status:        >700 → BLOCKED, >500 → UNDER_REVIEW, else APPROVED
```

Merchants VN: Amazon, Shopee, Grab, Lazada, Tiki, FPT Shop, Thế Giới Di Động, Viettel, Vingroup, Circle K, Highland Coffee, Starbucks VN

Locations: Hà Nội, TP.HCM, Đà Nẵng, Hải Phòng, Singapore, Tokyo, Seoul

Countries: VN, US, SG, JP, KR, TH, MY, CN, UK, DE

---

### Fraud Alerts — 80 bản ghi

```
ID format:     FA-00001 → FA-00080
Fraud Score:   500-1000
Priority:      HIGH / MEDIUM / LOW (ngẫu nhiên)
Status:        NEW / ASSIGNED / IN_REVIEW / RESOLVED / CLOSED
SLA:           Feb 16-20, 2026
Age:           0-72 giờ
```

Alert types: Transaction Fraud, Card Fraud, Account Takeover, Identity Theft, Phishing, SIM Swap

Rules triggered: Unusual Amount, New Device, Foreign Location, Velocity Exceeded, Card Not Present, Suspicious IP, Account Takeover Pattern, Rapid Fund Movement

---

### Cases — 35 bản ghi

```
ID format:     CASE-2024001 → CASE-2024035
Types:         CARD_FRAUD, ACCOUNT_TAKEOVER, IDENTITY_THEFT, MONEY_LAUNDERING, INSIDER_FRAUD
Status:        OPEN, UNDER_INVESTIGATION, PENDING_REVIEW, RESOLVED, CLOSED
Fraud Amount:  $1,000 → $100,000
Recovery:      $0 → $50,000
Alert Count:   1-10
Txn Count:     1-20
```

Case titles xoay vòng: Account Takeover Investigation, Card Fraud Ring, Identity Theft Case, Money Laundering Scheme, Insider Trading Alert, Phishing Campaign, SIM Swap Fraud, Unauthorized Wire Transfer

---

### AML Alerts — 40 bản ghi

```
ID format:     AML-00001 → AML-00040
Risk Score:    40-100
Txn Count:     1-20
Total Amount:  $5,000 → $500,000
```

Customers: Công ty ABC, Nguyễn Văn X, Trần Corp, Lê Holdings, Phạm Trading

Scenarios: Structuring, Rapid Movement of Funds, Round Dollar Amounts, High Risk Country, Unusual Cross-Border, Large Cash Transaction

---

### Customer Risk Profiles — 50 bản ghi

```
ID format:     CUS-0001 → CUS-0050
Types:         33% BUSINESS, 67% INDIVIDUAL
Risk Score:    0-100
PEP:           ~15% là PEP
KYC Status:    VERIFIED / PENDING / FAILED / EXPIRED
Accounts:      1-5
```

Business names: Công ty Alpha, Beta, Gamma, Delta, Omega

~10% có Sanction Match (OFAC, POSSIBLE_MATCH, score 60-100)

---

### ML Models — 6 bản ghi

| ID | Name | Algorithm | Status | Accuracy | Use Case |
|----|------|-----------|--------|----------|----------|
| MDL-001 | Fraud Detection XGBoost v3 | XGBoost | PRODUCTION | 95.6% | Fraud Detection |
| MDL-002 | AML Risk Scoring RF | Random Forest | PRODUCTION | 93.4% | AML |
| MDL-003 | Transaction Anomaly Detector | Isolation Forest | PRODUCTION | 92.1% | Transaction Monitoring |
| MDL-004 | Credit Risk Neural Net | Neural Network | TESTING | 94.5% | Credit Scoring |
| MDL-005 | Customer Segmentation KMeans | K-Means | PRODUCTION | 88.9% | Customer Analytics |
| MDL-006 | Fraud Ring Detection GNN | Graph Neural Network | DEVELOPMENT | 87.8% | Network Analysis |

---

### Data Assets — 8 bản ghi

| ID | Name | Type | Source | Classification |
|----|------|------|--------|---------------|
| DA-001 | transactions | TABLE | PostgreSQL - Main DB | CONFIDENTIAL |
| DA-002 | customers | TABLE | PostgreSQL - Main DB | PII |
| DA-003 | fraud_alerts | TABLE | PostgreSQL - Main DB | CONFIDENTIAL |
| DA-004 | kafka_transactions | STREAM | Apache Kafka | INTERNAL |
| DA-005 | risk_assessments | TABLE | PostgreSQL - Risk DB | INTERNAL |
| DA-006 | sanctions_lists | FILE | External Import | RESTRICTED |
| DA-007 | model_predictions | TABLE | Elasticsearch | INTERNAL |
| DA-008 | audit_logs | TABLE | PostgreSQL - Audit DB | RESTRICTED |

---

### Policies — 5 bản ghi

| ID | Name | Framework | Status |
|----|------|-----------|--------|
| POL-001 | Anti-Money Laundering Policy | BASEL_III | PUBLISHED |
| POL-002 | Data Privacy Policy | GDPR | PUBLISHED |
| POL-003 | Fraud Prevention Policy | PCI_DSS | PUBLISHED |
| POL-004 | IT Security Policy | ISO_27001 | REVIEW |
| POL-005 | Risk Management Framework | SOX | PUBLISHED |

---

### Audit Projects — 3 bản ghi

| ID | Name | Type | Status | Findings |
|----|------|------|--------|----------|
| AUD-001 | Q1 2026 Internal Audit | INTERNAL | IN_PROGRESS | 8 |
| AUD-002 | Regulatory Compliance Review | REGULATORY | PLANNED | 0 |
| AUD-003 | IT Security Audit | EXTERNAL (PwC) | COMPLETED | 12 |

---

### System Health — 9 services

| Service | Status | CPU | Memory | Response |
|---------|--------|-----|--------|----------|
| Spring Boot API | UP | 45% | 62% | 120ms |
| PostgreSQL | UP | 30% | 55% | 8ms |
| Apache Kafka | UP | 25% | 40% | 3ms |
| Apache Spark | UP | 60% | 75% | 250ms |
| Elasticsearch | UP | 35% | 68% | 15ms |
| Keycloak | UP | 20% | 35% | 45ms |
| Apache Airflow | DEGRADED | 78% | 82% | 350ms |
| Apache Atlas | UP | 22% | 45% | 85ms |
| Apache Ranger | UP | 18% | 30% | 50ms |

---

### Notifications — 8 bản ghi

| ID | Title | Type | Read |
|----|-------|------|------|
| N001 | Critical Risk Alert | ERROR | ❌ |
| N002 | New Fraud Alert (15 alerts/hour) | WARNING | ❌ |
| N003 | Case Assigned (CASE-2024005) | INFO | ❌ |
| N004 | Model Performance Alert (<95%) | WARNING | ✅ |
| N005 | Compliance Deadline (GDPR 7 days) | INFO | ✅ |
| N006 | System Update (Feb 20 maintenance) | INFO | ✅ |
| N007 | SAR Filed (SAR-2026-042) | SUCCESS | ✅ |
| N008 | AML Alert Escalated (AML-00012) | WARNING | ✅ |

---

### Dashboard Stats (computed)

```
Total Risks:           45
Critical Risks:        ~9 (random)
High Risks:            ~11 (random)
Medium Risks:          ~15 (random)
Low Risks:             ~10 (random)
Total Fraud Alerts:    80
Open Cases:            ~28 (all except CLOSED)
Transactions Today:    24,567
Fraud Prevented:       $1,250,000
False Positive Rate:   12.5%
Compliance Score:      87%
Models in Production:  4
```

---

## Tổng kết

```
Entity              Count    ID Pattern
─────────────────────────────────────────
Users                  8     U001-U008
Risks                 45     RSK-0001-0045
Transactions         200     TXN-000001-000200
Fraud Alerts          80     FA-00001-00080
Cases                 35     CASE-2024001-2024035
AML Alerts            40     AML-00001-00040
Customer Risks        50     CUS-0001-0050
ML Models              6     MDL-001-006
Data Assets            8     DA-001-008
Policies               5     POL-001-005
Audit Projects         3     AUD-001-003
System Health          9     (no ID)
Notifications          8     N001-N008
─────────────────────────────────────────
TOTAL               ~497     mock objects
```
