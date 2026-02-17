# IRIS Platform — Docker Compose

> Chạy toàn bộ infrastructure bằng 1 lệnh: `docker compose up -d`
>
> Yêu cầu: Docker Desktop đã cài, RAM ≥ 8GB

---

## File `docker-compose.yml`

Đặt ở thư mục gốc `iris-backend/docker-compose.yml`:

```yaml
version: '3.8'

services:

  # ═══════════════════════════════════════════
  # DATABASE
  # ═══════════════════════════════════════════

  postgres:
    image: postgres:16
    container_name: iris-postgres
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: iris
      POSTGRES_PASSWORD: iris123
      POSTGRES_DB: iris_admin
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./infrastructure/postgres/init-databases.sql:/docker-entrypoint-initdb.d/01-init.sql
      - ./infrastructure/postgres/seed-roles.sql:/docker-entrypoint-initdb.d/02-seed.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U iris"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - iris-network

  # ═══════════════════════════════════════════
  # CACHE
  # ═══════════════════════════════════════════

  redis:
    image: redis:7-alpine
    container_name: iris-redis
    ports:
      - "6379:6379"
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5
    networks:
      - iris-network

  # ═══════════════════════════════════════════
  # MESSAGE BROKER
  # ═══════════════════════════════════════════

  zookeeper:
    image: confluentinc/cp-zookeeper:7.6.0
    container_name: iris-zookeeper
    ports:
      - "2181:2181"
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    volumes:
      - zookeeper_data:/var/lib/zookeeper/data
    networks:
      - iris-network

  kafka:
    image: confluentinc/cp-kafka:7.6.0
    container_name: iris-kafka
    ports:
      - "9092:9092"
      - "29092:29092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:29092,PLAINTEXT_HOST://localhost:9092
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: "false"
    volumes:
      - kafka_data:/var/lib/kafka/data
    depends_on:
      zookeeper:
        condition: service_started
    healthcheck:
      test: ["CMD", "kafka-topics", "--bootstrap-server", "localhost:9092", "--list"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - iris-network

  kafka-init:
    image: confluentinc/cp-kafka:7.6.0
    container_name: iris-kafka-init
    depends_on:
      kafka:
        condition: service_healthy
    entrypoint: ["/bin/bash", "-c"]
    command: |
      "
      echo 'Creating Kafka topics...'

      kafka-topics --create --if-not-exists --bootstrap-server kafka:29092 --replication-factor 1 --partitions 3 --topic iris.risk.created
      kafka-topics --create --if-not-exists --bootstrap-server kafka:29092 --replication-factor 1 --partitions 3 --topic iris.risk.updated
      kafka-topics --create --if-not-exists --bootstrap-server kafka:29092 --replication-factor 1 --partitions 1 --topic iris.risk.threshold-breached

      kafka-topics --create --if-not-exists --bootstrap-server kafka:29092 --replication-factor 1 --partitions 6 --topic iris.fraud.alert-generated
      kafka-topics --create --if-not-exists --bootstrap-server kafka:29092 --replication-factor 1 --partitions 3 --topic iris.fraud.decision-made
      kafka-topics --create --if-not-exists --bootstrap-server kafka:29092 --replication-factor 1 --partitions 3 --topic iris.fraud.transaction-blocked

      kafka-topics --create --if-not-exists --bootstrap-server kafka:29092 --replication-factor 1 --partitions 3 --topic iris.aml.alert-generated
      kafka-topics --create --if-not-exists --bootstrap-server kafka:29092 --replication-factor 1 --partitions 1 --topic iris.aml.sar-filed

      kafka-topics --create --if-not-exists --bootstrap-server kafka:29092 --replication-factor 1 --partitions 6 --topic iris.transaction.flagged
      kafka-topics --create --if-not-exists --bootstrap-server kafka:29092 --replication-factor 1 --partitions 3 --topic iris.transaction.pattern-detected

      kafka-topics --create --if-not-exists --bootstrap-server kafka:29092 --replication-factor 1 --partitions 3 --topic iris.case.created
      kafka-topics --create --if-not-exists --bootstrap-server kafka:29092 --replication-factor 1 --partitions 3 --topic iris.case.escalated
      kafka-topics --create --if-not-exists --bootstrap-server kafka:29092 --replication-factor 1 --partitions 3 --topic iris.case.closed

      kafka-topics --create --if-not-exists --bootstrap-server kafka:29092 --replication-factor 1 --partitions 6 --topic iris.alert.generated
      kafka-topics --create --if-not-exists --bootstrap-server kafka:29092 --replication-factor 1 --partitions 3 --topic iris.alert.assigned
      kafka-topics --create --if-not-exists --bootstrap-server kafka:29092 --replication-factor 1 --partitions 3 --topic iris.alert.escalated

      kafka-topics --create --if-not-exists --bootstrap-server kafka:29092 --replication-factor 1 --partitions 1 --topic iris.model.drift-detected
      kafka-topics --create --if-not-exists --bootstrap-server kafka:29092 --replication-factor 1 --partitions 1 --topic iris.model.deployed

      kafka-topics --create --if-not-exists --bootstrap-server kafka:29092 --replication-factor 1 --partitions 3 --topic iris.notification.send
      kafka-topics --create --if-not-exists --bootstrap-server kafka:29092 --replication-factor 1 --partitions 3 --topic iris.audit.event

      echo 'All 20 topics created.'
      kafka-topics --list --bootstrap-server kafka:29092
      "
    networks:
      - iris-network

  # ═══════════════════════════════════════════
  # AUTHENTICATION
  # ═══════════════════════════════════════════

  keycloak:
    image: quay.io/keycloak/keycloak:24.0
    container_name: iris-keycloak
    ports:
      - "8180:8080"
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/iris_admin
      KC_DB_USERNAME: iris
      KC_DB_PASSWORD: iris123
      KC_HEALTH_ENABLED: "true"
    command: start-dev --import-realm
    volumes:
      - ./infrastructure/keycloak/iris-realm-export.json:/opt/keycloak/data/import/iris-realm-export.json
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "exec 3<>/dev/tcp/localhost/8080 && echo -e 'GET /health/ready HTTP/1.1\\r\\nHost: localhost\\r\\n\\r\\n' >&3 && cat <&3 | grep -q '200'"]
      interval: 10s
      timeout: 5s
      retries: 10
    networks:
      - iris-network

  # ═══════════════════════════════════════════
  # MONITORING (optional)
  # ═══════════════════════════════════════════

  kafka-ui:
    image: provectuslabs/kafka-ui:latest
    container_name: iris-kafka-ui
    ports:
      - "9090:8080"
    environment:
      KAFKA_CLUSTERS_0_NAME: iris-local
      KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS: kafka:29092
      KAFKA_CLUSTERS_0_ZOOKEEPER: zookeeper:2181
    depends_on:
      kafka:
        condition: service_healthy
    networks:
      - iris-network

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: iris-pgadmin
    ports:
      - "5050:80"
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@iris.com
      PGADMIN_DEFAULT_PASSWORD: admin123
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - iris-network

# ═══════════════════════════════════════════
# VOLUMES
# ═══════════════════════════════════════════

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  zookeeper_data:
    driver: local
  kafka_data:
    driver: local

# ═══════════════════════════════════════════
# NETWORK
# ═══════════════════════════════════════════

networks:
  iris-network:
    driver: bridge
    name: iris-network
```

---

## File `infrastructure/postgres/init-databases.sql`

```sql
-- Tạo 12 databases cho 12 microservices
CREATE DATABASE iris_risk;
CREATE DATABASE iris_fraud;
CREATE DATABASE iris_aml;
CREATE DATABASE iris_transaction;
CREATE DATABASE iris_case;
CREATE DATABASE iris_alert;
CREATE DATABASE iris_model;
CREATE DATABASE iris_governance;
CREATE DATABASE iris_compliance;
CREATE DATABASE iris_report;
CREATE DATABASE iris_notification;
-- iris_admin đã được tạo sẵn bởi POSTGRES_DB env

-- Grant quyền
GRANT ALL PRIVILEGES ON DATABASE iris_risk TO iris;
GRANT ALL PRIVILEGES ON DATABASE iris_fraud TO iris;
GRANT ALL PRIVILEGES ON DATABASE iris_aml TO iris;
GRANT ALL PRIVILEGES ON DATABASE iris_transaction TO iris;
GRANT ALL PRIVILEGES ON DATABASE iris_case TO iris;
GRANT ALL PRIVILEGES ON DATABASE iris_alert TO iris;
GRANT ALL PRIVILEGES ON DATABASE iris_model TO iris;
GRANT ALL PRIVILEGES ON DATABASE iris_governance TO iris;
GRANT ALL PRIVILEGES ON DATABASE iris_compliance TO iris;
GRANT ALL PRIVILEGES ON DATABASE iris_report TO iris;
GRANT ALL PRIVILEGES ON DATABASE iris_notification TO iris;
```

---

## File `infrastructure/postgres/seed-roles.sql`

```sql
-- Chạy trong iris_admin (default DB)
-- Seed sau khi Flyway tạo bảng

-- Nếu muốn seed trước khi có Flyway, tạo bảng tạm:
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO roles (name, description) VALUES
('ADMIN', 'Full system access - all modules, all actions'),
('RISK_MANAGER', 'Manage risks, approve assessments, view reports'),
('RISK_ANALYST', 'Create risks, run assessments, manage controls'),
('FRAUD_ANALYST', 'Investigate fraud alerts, manage rules, decisions'),
('AML_ANALYST', 'AML screening, customer risk, SAR filing'),
('COMPLIANCE_OFFICER', 'Policies, audits, violations, regulatory reports'),
('CASE_INVESTIGATOR', 'Case investigation, evidence, communications'),
('VIEWER', 'Read-only access to all modules'),
('BUSINESS_USER', 'Limited operational access, view dashboards')
ON CONFLICT (name) DO NOTHING;
```

---

## Lệnh sử dụng

### Khởi động tất cả

```bash
docker compose up -d
```

### Kiểm tra status

```bash
docker compose ps
```

Kết quả mong đợi:

```
NAME               IMAGE                          STATUS          PORTS
iris-postgres      postgres:16                    Up (healthy)    0.0.0.0:5432->5432
iris-redis         redis:7-alpine                 Up (healthy)    0.0.0.0:6379->6379
iris-zookeeper     confluentinc/cp-zookeeper      Up              0.0.0.0:2181->2181
iris-kafka         confluentinc/cp-kafka           Up (healthy)    0.0.0.0:9092->9092
iris-kafka-init    confluentinc/cp-kafka           Exited (0)      (topics created)
iris-keycloak      keycloak:24.0                  Up (healthy)    0.0.0.0:8180->8080
iris-kafka-ui      provectuslabs/kafka-ui          Up              0.0.0.0:9090->8080
iris-pgadmin       dpage/pgadmin4                  Up              0.0.0.0:5050->80
```

### Xem logs

```bash
docker compose logs -f postgres
docker compose logs -f kafka
docker compose logs -f keycloak
```

### Dừng

```bash
docker compose stop          # Dừng, giữ data
docker compose down          # Dừng, xóa containers
docker compose down -v       # Dừng, xóa tất cả kể cả data volumes
```

### Restart 1 service

```bash
docker compose restart postgres
docker compose restart kafka
```

---

## Truy cập

| Service | URL | Credentials |
|---------|-----|-------------|
| PostgreSQL | `localhost:5432` | user: `iris` / pass: `iris123` |
| Redis | `localhost:6379` | không cần auth |
| Kafka | `localhost:9092` | không cần auth |
| Keycloak Admin | http://localhost:8180 | user: `admin` / pass: `admin` |
| Kafka UI | http://localhost:9090 | không cần auth |
| pgAdmin | http://localhost:5050 | email: `admin@iris.com` / pass: `admin123` |

---

## Kết nối pgAdmin → PostgreSQL

Lần đầu mở pgAdmin, thêm server:

```
Name:       IRIS Local
Host:       host.docker.internal    (hoặc iris-postgres nếu pgAdmin cùng network)
Port:       5432
Database:   iris_admin
Username:   iris
Password:   iris123
```

---

## RAM Usage ước tính

```
Service          RAM
────────────────────────
PostgreSQL       200-400 MB
Redis             50-100 MB
Zookeeper        100-200 MB
Kafka            500-800 MB
Keycloak         300-500 MB
Kafka UI          50-100 MB
pgAdmin           50-100 MB
────────────────────────
TOTAL           1.2-2.2 GB
```

Máy 8GB RAM: chạy được infra + 3-4 Spring Boot services

Máy 16GB RAM: chạy full stack thoải mái

---

## Thứ tự khởi động (Docker Compose tự handle)

```
1. postgres       (healthcheck: pg_isready)
2. redis          (healthcheck: redis-cli ping)
3. zookeeper      (no dependency)
4. kafka          (depends: zookeeper)
5. kafka-init     (depends: kafka healthy → tạo 20 topics → exit)
6. keycloak       (depends: postgres healthy)
7. kafka-ui       (depends: kafka healthy)
8. pgadmin        (depends: postgres healthy)
```
