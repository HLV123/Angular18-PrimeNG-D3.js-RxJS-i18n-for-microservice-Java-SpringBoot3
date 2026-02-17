# IRIS Platform — Database Schema

> PostgreSQL 16 · Database-per-Service · Flyway migrations
>
> Tất cả tables đều có: `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`, `created_at`, `updated_at`
>
> Tên convention: `snake_case` cho table/column, `UPPER_CASE` cho enum values

---

## 1. iris_risk

```sql
-- Enums
CREATE TYPE risk_level AS ENUM ('CRITICAL','HIGH','MEDIUM','LOW');
CREATE TYPE risk_category AS ENUM ('STRATEGIC','FINANCIAL','OPERATIONAL','COMPLIANCE','REPUTATIONAL');
CREATE TYPE risk_status AS ENUM ('DRAFT','ACTIVE','CLOSED','RETIRED');
CREATE TYPE treatment_strategy AS ENUM ('AVOID','REDUCE','TRANSFER','ACCEPT');
CREATE TYPE control_type AS ENUM ('PREVENTIVE','DETECTIVE','CORRECTIVE');

-- Risks
CREATE TABLE risks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    category        risk_category NOT NULL,
    department      VARCHAR(100),
    owner_id        UUID NOT NULL,
    owner_name      VARCHAR(100),
    status          risk_status DEFAULT 'DRAFT',
    likelihood      INT CHECK (likelihood BETWEEN 1 AND 5),
    impact          INT CHECK (impact BETWEEN 1 AND 5),
    inherent_score  INT GENERATED ALWAYS AS (likelihood * impact) STORED,
    residual_score  INT,
    risk_level      risk_level,
    velocity        VARCHAR(50),
    appetite        INT,
    control_effectiveness INT DEFAULT 0,
    treatment_strategy    treatment_strategy,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW(),
    last_assessment_date TIMESTAMP
);

CREATE INDEX idx_risks_status ON risks(status);
CREATE INDEX idx_risks_category ON risks(category);
CREATE INDEX idx_risks_owner ON risks(owner_id);
CREATE INDEX idx_risks_level ON risks(risk_level);

-- Risk Assessments
CREATE TABLE risk_assessments (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    risk_id      UUID REFERENCES risks(id) ON DELETE CASCADE,
    name         VARCHAR(255) NOT NULL,
    scope        TEXT,
    framework    VARCHAR(100),
    period_from  DATE,
    period_to    DATE,
    status       VARCHAR(20) DEFAULT 'DRAFT',
    team_members TEXT[],
    created_at   TIMESTAMP DEFAULT NOW(),
    updated_at   TIMESTAMP DEFAULT NOW()
);

-- Controls
CREATE TABLE controls (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    risk_id          UUID REFERENCES risks(id) ON DELETE CASCADE,
    description      TEXT NOT NULL,
    type             control_type NOT NULL,
    effectiveness    INT CHECK (effectiveness BETWEEN 0 AND 100),
    test_frequency   VARCHAR(50),
    last_test_date   TIMESTAMP,
    last_test_result VARCHAR(10),
    created_at       TIMESTAMP DEFAULT NOW()
);

-- KRIs
CREATE TABLE kris (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    risk_id             UUID REFERENCES risks(id) ON DELETE CASCADE,
    name                VARCHAR(255) NOT NULL,
    description         TEXT,
    current_value       DECIMAL(15,2),
    warning_threshold   DECIMAL(15,2),
    critical_threshold  DECIMAL(15,2),
    trend               VARCHAR(10),
    unit                VARCHAR(20),
    created_at          TIMESTAMP DEFAULT NOW()
);

CREATE TABLE kri_history (
    id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kri_id    UUID REFERENCES kris(id) ON DELETE CASCADE,
    value     DECIMAL(15,2),
    recorded_at TIMESTAMP DEFAULT NOW()
);

-- Action Plans
CREATE TABLE action_plans (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    risk_id      UUID REFERENCES risks(id) ON DELETE CASCADE,
    description  TEXT NOT NULL,
    responsible  VARCHAR(100),
    due_date     DATE,
    status       VARCHAR(20) DEFAULT 'NOT_STARTED',
    completion   INT DEFAULT 0,
    created_at   TIMESTAMP DEFAULT NOW()
);

-- Documents
CREATE TABLE risk_documents (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    risk_id     UUID REFERENCES risks(id) ON DELETE CASCADE,
    file_name   VARCHAR(255) NOT NULL,
    file_path   VARCHAR(500) NOT NULL,
    file_size   BIGINT,
    mime_type   VARCHAR(100),
    uploaded_by UUID,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- History
CREATE TABLE risk_history (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    risk_id     UUID REFERENCES risks(id) ON DELETE CASCADE,
    action      VARCHAR(50) NOT NULL,
    field_name  VARCHAR(100),
    old_value   TEXT,
    new_value   TEXT,
    changed_by  UUID,
    changed_at  TIMESTAMP DEFAULT NOW()
);
```

---

## 2. iris_fraud

```sql
CREATE TYPE alert_priority AS ENUM ('HIGH','MEDIUM','LOW');
CREATE TYPE alert_status AS ENUM ('NEW','ASSIGNED','IN_REVIEW','RESOLVED','CLOSED');
CREATE TYPE txn_status AS ENUM ('APPROVED','BLOCKED','UNDER_REVIEW','PENDING');
CREATE TYPE txn_type AS ENUM ('PURCHASE','TRANSFER','WITHDRAWAL','DEPOSIT','PAYMENT');
CREATE TYPE txn_channel AS ENUM ('ATM','POS','ONLINE','MOBILE','BRANCH');

-- Fraud Alerts
CREATE TABLE fraud_alerts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id  UUID NOT NULL,
    customer_id     VARCHAR(50) NOT NULL,
    customer_name   VARCHAR(100),
    alert_type      VARCHAR(50),
    fraud_score     INT CHECK (fraud_score BETWEEN 0 AND 1000),
    priority        alert_priority,
    status          alert_status DEFAULT 'NEW',
    assigned_to     UUID,
    assigned_to_name VARCHAR(100),
    rule_triggered  VARCHAR(100),
    description     TEXT,
    amount          DECIMAL(15,2),
    channel         txn_channel,
    sla_deadline    TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fraud_alerts_status ON fraud_alerts(status);
CREATE INDEX idx_fraud_alerts_priority ON fraud_alerts(priority);
CREATE INDEX idx_fraud_alerts_customer ON fraud_alerts(customer_id);
CREATE INDEX idx_fraud_alerts_created ON fraud_alerts(created_at DESC);

-- Fraud Rules
CREATE TABLE fraud_rules (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(255) NOT NULL,
    description         TEXT,
    category            VARCHAR(50),
    priority            alert_priority,
    actions             TEXT[],
    hit_rate            DECIMAL(5,2),
    false_positive_rate DECIMAL(5,2),
    status              VARCHAR(20) DEFAULT 'ACTIVE',
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE TABLE rule_conditions (
    id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id   UUID REFERENCES fraud_rules(id) ON DELETE CASCADE,
    field     VARCHAR(100) NOT NULL,
    operator  VARCHAR(20) NOT NULL,
    value     VARCHAR(255) NOT NULL,
    logic     VARCHAR(3) DEFAULT 'AND'
);

-- Fraud Decisions
CREATE TABLE fraud_decisions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id    UUID REFERENCES fraud_alerts(id),
    decision    VARCHAR(30) NOT NULL,
    notes       TEXT,
    decided_by  UUID,
    decided_at  TIMESTAMP DEFAULT NOW()
);

-- Blacklist
CREATE TABLE blacklist_entries (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type         VARCHAR(20) NOT NULL,
    identifier   VARCHAR(255) NOT NULL,
    reason       TEXT,
    added_by     UUID,
    expires_at   TIMESTAMP,
    created_at   TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_blacklist_unique ON blacklist_entries(type, identifier);

-- Watchlist
CREATE TABLE watchlist_entries (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type         VARCHAR(20) NOT NULL,
    identifier   VARCHAR(255) NOT NULL,
    reason       TEXT,
    flag_level   VARCHAR(20),
    alert_count  INT DEFAULT 0,
    added_by     UUID,
    created_at   TIMESTAMP DEFAULT NOW()
);
```

---

## 3. iris_aml

```sql
-- AML Alerts
CREATE TABLE aml_alerts (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id       VARCHAR(50) NOT NULL,
    customer_name     VARCHAR(100),
    risk_score        INT,
    scenario          VARCHAR(100),
    status            VARCHAR(20) DEFAULT 'NEW',
    priority          VARCHAR(10),
    assigned_to       UUID,
    transaction_count INT,
    total_amount      DECIMAL(15,2),
    created_at        TIMESTAMP DEFAULT NOW(),
    updated_at        TIMESTAMP DEFAULT NOW()
);

-- Customer Risk
CREATE TABLE customer_risks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    type            VARCHAR(20),
    risk_score      INT,
    risk_category   VARCHAR(10),
    is_pep          BOOLEAN DEFAULT FALSE,
    kyc_status      VARCHAR(20),
    country_risk    VARCHAR(10),
    last_review     DATE,
    next_review_due DATE,
    account_count   INT DEFAULT 0,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- Sanction Matches
CREATE TABLE sanction_matches (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id   UUID REFERENCES customer_risks(id),
    list_source   VARCHAR(100),
    match_score   DECIMAL(5,2),
    matched_name  VARCHAR(255),
    status        VARCHAR(30) DEFAULT 'POSSIBLE_MATCH',
    reviewed_by   UUID,
    reviewed_at   TIMESTAMP,
    created_at    TIMESTAMP DEFAULT NOW()
);

-- SARs
CREATE TABLE sars (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id   VARCHAR(50),
    customer_name VARCHAR(100),
    status        VARCHAR(20) DEFAULT 'DRAFT',
    filed_date    TIMESTAMP,
    description   TEXT,
    amount        DECIMAL(15,2),
    created_by    UUID,
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP DEFAULT NOW()
);

-- Watch Lists
CREATE TABLE watch_lists (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    source      VARCHAR(100),
    entry_count INT DEFAULT 0,
    last_updated TIMESTAMP,
    file_path   VARCHAR(500),
    created_at  TIMESTAMP DEFAULT NOW()
);
```

---

## 4. iris_transaction

```sql
-- Transactions
CREATE TABLE transactions (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp         TIMESTAMP NOT NULL,
    customer_id       VARCHAR(50) NOT NULL,
    customer_name     VARCHAR(100),
    account_id        VARCHAR(50),
    type              VARCHAR(20),
    amount            DECIMAL(15,2) NOT NULL,
    currency          VARCHAR(3) DEFAULT 'USD',
    merchant          VARCHAR(255),
    beneficiary       VARCHAR(255),
    channel           VARCHAR(20),
    location          VARCHAR(255),
    country           VARCHAR(3),
    latitude          DECIMAL(10,6),
    longitude         DECIMAL(10,6),
    fraud_score       INT DEFAULT 0,
    risk_level        VARCHAR(10),
    status            VARCHAR(20) DEFAULT 'APPROVED',
    device_fingerprint VARCHAR(100),
    ip_address        VARCHAR(45),
    card_number       VARCHAR(20),
    created_at        TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_txn_customer ON transactions(customer_id);
CREATE INDEX idx_txn_timestamp ON transactions(timestamp DESC);
CREATE INDEX idx_txn_status ON transactions(status);
CREATE INDEX idx_txn_fraud_score ON transactions(fraud_score DESC);

-- Scenarios
CREATE TABLE scenarios (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    logic       JSONB,
    active      BOOLEAN DEFAULT TRUE,
    hit_count   INT DEFAULT 0,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- Behavior Profiles
CREATE TABLE behavior_profiles (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id       VARCHAR(50) NOT NULL UNIQUE,
    avg_amount        DECIMAL(15,2),
    avg_txn_count     INT,
    peer_group        VARCHAR(50),
    anomaly_score     DECIMAL(5,2),
    last_calculated   TIMESTAMP,
    profile_data      JSONB
);

-- Pattern Detections
CREATE TABLE pattern_detections (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type          VARCHAR(50) NOT NULL,
    customer_ids  TEXT[],
    description   TEXT,
    severity      VARCHAR(10),
    detected_at   TIMESTAMP DEFAULT NOW()
);
```

---

## 5. iris_case

```sql
CREATE TYPE case_status AS ENUM ('OPEN','UNDER_INVESTIGATION','PENDING_REVIEW','RESOLVED','CLOSED');
CREATE TYPE case_type AS ENUM ('CARD_FRAUD','ACCOUNT_TAKEOVER','IDENTITY_THEFT','MONEY_LAUNDERING','INSIDER_FRAUD');

-- Cases
CREATE TABLE cases (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title             VARCHAR(255) NOT NULL,
    type              case_type,
    status            case_status DEFAULT 'OPEN',
    priority          VARCHAR(10),
    customer_id       VARCHAR(50),
    customer_name     VARCHAR(100),
    assigned_to       UUID,
    assigned_to_name  VARCHAR(100),
    fraud_amount      DECIMAL(15,2) DEFAULT 0,
    recovery_amount   DECIMAL(15,2) DEFAULT 0,
    description       TEXT,
    open_date         TIMESTAMP DEFAULT NOW(),
    closed_date       TIMESTAMP,
    sla_deadline      TIMESTAMP,
    alert_count       INT DEFAULT 0,
    transaction_count INT DEFAULT 0,
    document_count    INT DEFAULT 0,
    created_at        TIMESTAMP DEFAULT NOW(),
    updated_at        TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_assigned ON cases(assigned_to);
CREATE INDEX idx_cases_priority ON cases(priority);

-- Case Notes
CREATE TABLE case_notes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id     UUID REFERENCES cases(id) ON DELETE CASCADE,
    author_id   UUID NOT NULL,
    author_name VARCHAR(100),
    content     TEXT NOT NULL,
    type        VARCHAR(20) DEFAULT 'NOTE',
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Evidence
CREATE TABLE evidence (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id     UUID REFERENCES cases(id) ON DELETE CASCADE,
    file_name   VARCHAR(255) NOT NULL,
    file_path   VARCHAR(500) NOT NULL,
    file_size   BIGINT,
    mime_type   VARCHAR(100),
    description TEXT,
    uploaded_by UUID,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Tasks
CREATE TABLE case_tasks (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id     UUID REFERENCES cases(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to UUID,
    due_date    DATE,
    status      VARCHAR(20) DEFAULT 'OPEN',
    completed_at TIMESTAMP,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Communications
CREATE TABLE communications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id     UUID REFERENCES cases(id) ON DELETE CASCADE,
    type        VARCHAR(20),
    direction   VARCHAR(10),
    subject     VARCHAR(255),
    content     TEXT,
    sender      VARCHAR(100),
    recipient   VARCHAR(100),
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Financial Summary
CREATE TABLE financial_summaries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id         UUID REFERENCES cases(id) ON DELETE CASCADE UNIQUE,
    total_fraud     DECIMAL(15,2) DEFAULT 0,
    total_recovery  DECIMAL(15,2) DEFAULT 0,
    total_loss      DECIMAL(15,2) DEFAULT 0,
    data            JSONB,
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- Timeline
CREATE TABLE case_timeline (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id     UUID REFERENCES cases(id) ON DELETE CASCADE,
    event_type  VARCHAR(50),
    description TEXT,
    actor       VARCHAR(100),
    created_at  TIMESTAMP DEFAULT NOW()
);
```

---

## 6. iris_alert

```sql
-- Alerts
CREATE TABLE alerts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type            VARCHAR(20) NOT NULL,
    source          VARCHAR(10),
    subject         VARCHAR(255),
    subject_type    VARCHAR(20),
    priority        VARCHAR(10),
    score           INT,
    status          VARCHAR(20) DEFAULT 'NEW',
    assigned_to     UUID,
    assigned_to_name VARCHAR(100),
    sla_countdown   INT,
    description     TEXT,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- Alert Rules
CREATE TABLE alert_rules (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    condition   JSONB,
    action      VARCHAR(50),
    priority    VARCHAR(10),
    active      BOOLEAN DEFAULT TRUE,
    hit_count   INT DEFAULT 0,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Alert Notes
CREATE TABLE alert_notes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id    UUID REFERENCES alerts(id) ON DELETE CASCADE,
    content     TEXT,
    author_id   UUID,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Routing Config
CREATE TABLE routing_config (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255),
    criteria    JSONB,
    target_team VARCHAR(100),
    target_user UUID,
    active      BOOLEAN DEFAULT TRUE
);

-- Escalation Policies
CREATE TABLE escalation_policies (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255),
    trigger_after   INT,
    escalate_to     UUID,
    notify          TEXT[],
    active          BOOLEAN DEFAULT TRUE
);
```

---

## 7. iris_model

```sql
CREATE TYPE model_status AS ENUM ('DEVELOPMENT','TESTING','STAGING','PRODUCTION','RETIRED');

-- ML Models
CREATE TABLE ml_models (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name             VARCHAR(255) NOT NULL,
    type             VARCHAR(30),
    use_case         VARCHAR(100),
    algorithm        VARCHAR(100),
    version          VARCHAR(20),
    status           model_status DEFAULT 'DEVELOPMENT',
    accuracy         DECIMAL(5,4),
    precision_val    DECIMAL(5,4),
    recall           DECIMAL(5,4),
    f1_score         DECIMAL(5,4),
    auc              DECIMAL(5,4),
    owner_id         UUID,
    prediction_count BIGINT DEFAULT 0,
    avg_latency      DECIMAL(10,2),
    created_at       TIMESTAMP DEFAULT NOW(),
    updated_at       TIMESTAMP DEFAULT NOW()
);

-- Model Versions
CREATE TABLE model_versions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id    UUID REFERENCES ml_models(id) ON DELETE CASCADE,
    version     VARCHAR(20) NOT NULL,
    artifact    VARCHAR(500),
    metrics     JSONB,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Model Metrics (time series)
CREATE TABLE model_metrics (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id    UUID REFERENCES ml_models(id) ON DELETE CASCADE,
    metric_name VARCHAR(50),
    value       DECIMAL(10,4),
    recorded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_model_metrics_time ON model_metrics(model_id, recorded_at DESC);

-- Deployment History
CREATE TABLE deployment_history (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id     UUID REFERENCES ml_models(id),
    version      VARCHAR(20),
    environment  VARCHAR(20),
    deployed_by  UUID,
    deployed_at  TIMESTAMP DEFAULT NOW(),
    rolled_back  BOOLEAN DEFAULT FALSE
);

-- Validation Records
CREATE TABLE validation_records (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id    UUID REFERENCES ml_models(id),
    status      VARCHAR(20),
    validator   UUID,
    notes       TEXT,
    created_at  TIMESTAMP DEFAULT NOW()
);
```

---

## 8. iris_governance

```sql
-- Data Assets
CREATE TABLE data_assets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    type            VARCHAR(20),
    source          VARCHAR(255),
    owner_id        UUID,
    classification  VARCHAR(20) DEFAULT 'INTERNAL',
    quality_score   INT,
    tags            TEXT[],
    description     TEXT,
    schema_def      JSONB,
    last_updated    TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Quality Rules
CREATE TABLE quality_rules (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    asset_id    UUID REFERENCES data_assets(id),
    dimension   VARCHAR(20),
    rule_expr   TEXT NOT NULL,
    status      VARCHAR(10) DEFAULT 'PASS',
    score       INT,
    last_run    TIMESTAMP,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Quality Issues
CREATE TABLE quality_issues (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id     UUID REFERENCES quality_rules(id),
    asset_id    UUID REFERENCES data_assets(id),
    description TEXT,
    severity    VARCHAR(10),
    status      VARCHAR(20) DEFAULT 'OPEN',
    resolved_at TIMESTAMP,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Classifications
CREATE TABLE classifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id    UUID REFERENCES data_assets(id),
    level       VARCHAR(20),
    pii_fields  TEXT[],
    encryption  VARCHAR(50),
    scanned_at  TIMESTAMP,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Access Policies
CREATE TABLE access_policies (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255),
    asset_id    UUID REFERENCES data_assets(id),
    role        VARCHAR(50),
    permission  VARCHAR(20),
    active      BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Retention Policies
CREATE TABLE retention_policies (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255),
    data_type       VARCHAR(100),
    retention_years INT,
    archival_action VARCHAR(50),
    deletion_action VARCHAR(50),
    compliance_ref  VARCHAR(50),
    status          VARCHAR(20) DEFAULT 'ACTIVE',
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Lineage
CREATE TABLE lineage_edges (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id   UUID REFERENCES data_assets(id),
    target_id   UUID REFERENCES data_assets(id),
    type        VARCHAR(20),
    description TEXT,
    created_at  TIMESTAMP DEFAULT NOW()
);
```

---

## 9. iris_compliance

```sql
CREATE TYPE compliance_framework AS ENUM ('GDPR','PCI_DSS','SOX','ISO_27001','BASEL_III');

-- Policies
CREATE TABLE policies (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name           VARCHAR(255) NOT NULL,
    category       VARCHAR(50),
    description    TEXT,
    version        VARCHAR(20),
    effective_date DATE,
    review_date    DATE,
    owner_id       UUID,
    status         VARCHAR(20) DEFAULT 'DRAFT',
    framework      compliance_framework,
    created_at     TIMESTAMP DEFAULT NOW(),
    updated_at     TIMESTAMP DEFAULT NOW()
);

-- Compliance Controls
CREATE TABLE compliance_controls (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    framework       compliance_framework,
    category        VARCHAR(100),
    owner           VARCHAR(100),
    effectiveness   INT,
    last_test_date  DATE,
    test_result     VARCHAR(20),
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Audit Projects
CREATE TABLE audit_projects (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(255) NOT NULL,
    type          VARCHAR(20),
    status        VARCHAR(20) DEFAULT 'PLANNED',
    auditor       VARCHAR(100),
    start_date    DATE,
    end_date      DATE,
    scope         TEXT,
    finding_count INT DEFAULT 0,
    created_at    TIMESTAMP DEFAULT NOW()
);

-- Audit Findings
CREATE TABLE audit_findings (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id            UUID REFERENCES audit_projects(id) ON DELETE CASCADE,
    severity            VARCHAR(10),
    description         TEXT NOT NULL,
    root_cause          TEXT,
    recommendation      TEXT,
    management_response TEXT,
    due_date            DATE,
    status              VARCHAR(20) DEFAULT 'OPEN',
    assigned_to         VARCHAR(100),
    created_at          TIMESTAMP DEFAULT NOW()
);

-- Training
CREATE TABLE training_courses (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    duration    INT,
    mandatory   BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE training_records (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id   UUID REFERENCES training_courses(id),
    user_id     UUID NOT NULL,
    status      VARCHAR(20) DEFAULT 'ENROLLED',
    completed_at TIMESTAMP,
    score       INT,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Violations
CREATE TABLE violations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description     TEXT NOT NULL,
    regulation      VARCHAR(100),
    severity        VARCHAR(10),
    remediation     TEXT,
    due_date        DATE,
    status          VARCHAR(20) DEFAULT 'OPEN',
    detected_at     TIMESTAMP DEFAULT NOW(),
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Regulatory Reports
CREATE TABLE regulatory_reports (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255),
    regulator   VARCHAR(100),
    frequency   VARCHAR(20),
    next_due    DATE,
    status      VARCHAR(20) DEFAULT 'NOT_STARTED',
    submitted_at TIMESTAMP,
    created_at  TIMESTAMP DEFAULT NOW()
);
```

---

## 10. iris_admin

```sql
-- Users
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username    VARCHAR(50) NOT NULL UNIQUE,
    email       VARCHAR(255) NOT NULL UNIQUE,
    full_name   VARCHAR(100),
    first_name  VARCHAR(50),
    last_name   VARCHAR(50),
    department  VARCHAR(100),
    title       VARCHAR(100),
    phone       VARCHAR(20),
    avatar_url  VARCHAR(500),
    manager_id  UUID REFERENCES users(id),
    status      VARCHAR(10) DEFAULT 'ACTIVE',
    last_login  TIMESTAMP,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- Roles
CREATE TABLE roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Permissions
CREATE TABLE permissions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL UNIQUE,
    module      VARCHAR(50),
    action      VARCHAR(20)
);

-- User-Roles (many-to-many)
CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Role-Permissions (many-to-many)
CREATE TABLE role_permissions (
    role_id       UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Departments
CREATE TABLE departments (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name         VARCHAR(100) NOT NULL,
    parent_id    UUID REFERENCES departments(id),
    head_id      UUID REFERENCES users(id),
    member_count INT DEFAULT 0,
    created_at   TIMESTAMP DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID,
    user_name    VARCHAR(100),
    action       VARCHAR(10) NOT NULL,
    entity_type  VARCHAR(50),
    entity_id    VARCHAR(50),
    old_value    JSONB,
    new_value    JSONB,
    ip_address   VARCHAR(45),
    result       VARCHAR(10),
    timestamp    TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_time ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Code Tables (Reference Data)
CREATE TABLE code_tables (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL UNIQUE,
    entries     JSONB NOT NULL,
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- Notification Rules
CREATE TABLE notification_rules (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255),
    event_type  VARCHAR(50),
    condition   JSONB,
    channels    TEXT[],
    recipients  TEXT[],
    active      BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Workflows
CREATE TABLE workflow_definitions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    module      VARCHAR(50),
    steps       JSONB NOT NULL,
    active      BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE workflow_instances (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    definition_id UUID REFERENCES workflow_definitions(id),
    entity_type   VARCHAR(50),
    entity_id     UUID,
    current_step  INT DEFAULT 0,
    status        VARCHAR(20) DEFAULT 'ACTIVE',
    started_at    TIMESTAMP DEFAULT NOW(),
    completed_at  TIMESTAMP
);

-- System Settings
CREATE TABLE system_settings (
    key         VARCHAR(100) PRIMARY KEY,
    value       TEXT,
    category    VARCHAR(50),
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- Backups
CREATE TABLE backups (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name   VARCHAR(255),
    file_size   BIGINT,
    status      VARCHAR(20),
    created_by  UUID,
    created_at  TIMESTAMP DEFAULT NOW()
);
```

---

## 11. iris_report

```sql
-- Reports
CREATE TABLE reports (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    type        VARCHAR(50),
    config      JSONB,
    created_by  UUID,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Report Schedules
CREATE TABLE report_schedules (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id   UUID REFERENCES reports(id),
    frequency   VARCHAR(20),
    recipients  TEXT[],
    format      VARCHAR(10),
    next_run    TIMESTAMP,
    active      BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Report History
CREATE TABLE report_history (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id   UUID REFERENCES reports(id),
    file_path   VARCHAR(500),
    file_size   BIGINT,
    format      VARCHAR(10),
    generated_at TIMESTAMP DEFAULT NOW()
);

-- Report Templates
CREATE TABLE report_templates (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255),
    type        VARCHAR(50),
    template    JSONB,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Dashboards
CREATE TABLE dashboards (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255),
    layout      JSONB,
    widgets     JSONB,
    owner_id    UUID,
    shared      BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);
```

---

## 12. iris_notification

```sql
-- Notifications
CREATE TABLE notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL,
    title       VARCHAR(255) NOT NULL,
    message     TEXT,
    type        VARCHAR(10) DEFAULT 'INFO',
    read        BOOLEAN DEFAULT FALSE,
    link        VARCHAR(500),
    icon        VARCHAR(50),
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, read, created_at DESC);
```

---

## Seed Data — 9 Roles

```sql
-- Chạy trong iris_admin
INSERT INTO roles (name, description) VALUES
('ADMIN', 'Full system access'),
('RISK_MANAGER', 'Manage risks, approve assessments'),
('RISK_ANALYST', 'Create and assess risks'),
('FRAUD_ANALYST', 'Investigate fraud alerts'),
('AML_ANALYST', 'AML screening and SAR filing'),
('COMPLIANCE_OFFICER', 'Policies, audits, violations'),
('CASE_INVESTIGATOR', 'Case investigation and evidence'),
('VIEWER', 'Read-only access'),
('BUSINESS_USER', 'Limited operational access');
```

---

## Tổng kết

```
Database              Tables    Indexes
──────────────────────────────────────────
iris_risk                8         4
iris_fraud               6         5
iris_aml                 5         0
iris_transaction         4         4
iris_case                7         3
iris_alert               5         0
iris_model               5         1
iris_governance          7         0
iris_compliance          8         0
iris_admin              12         3
iris_report              5         0
iris_notification        1         1
──────────────────────────────────────────
TOTAL                   73        21
```
