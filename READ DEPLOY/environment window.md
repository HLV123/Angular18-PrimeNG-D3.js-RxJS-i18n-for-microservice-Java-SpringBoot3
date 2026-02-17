# Hướng dẫn cài đặt môi trường trên Windows

---
## Tổng quan

```
Cần cài                          Dùng cho
──────────────────────────────────────────────────────────
Node.js 20+                      Frontend Angular
Java JDK 17+                     Backend Spring Boot
Maven 3.9+                       Build backend
PostgreSQL 16                    Database
Apache Kafka 3.7+                Message broker
Redis 7+                         Cache + session
Keycloak 24+                     SSO / Authentication
Docker Desktop                   Chạy infra (Kafka, Redis, Keycloak)
IntelliJ IDEA                    Code backend
```
Hướng dẫn này đi theo cách cài:
- **Docker cho infra:** Cài Node, Java, Maven trực tiếp. Chạy PostgreSQL, Kafka, Redis, Keycloak bằng Docker. *(Khuyên dùng)*
---

Cài Angular CLI global:

```
npm install -g @angular/cli
```
Kiểm tra:

```
ng version
```

```
Angular CLI: 18.x.x
```

---

## Java JDK 17 (cho Backend)
## Apache Maven (cho Backend)
Tải binary zip: https://maven.apache.org/download.cgi
Giải nén vào `C:\tools\apache-maven-3.9.9`
Thêm vào PATH:

```
Chuột phải This PC → Properties → Advanced system settings → Environment Variables
Sửa System variable "Path", thêm dòng:
  C:\tools\apache-maven-3.9.9\bin
```
Mở terminal mới, kiểm tra:

```
mvn -v
```

```
Apache Maven 3.9.9
Java version: 17.0.x
```

---

## Docker Desktop (cho Kafka, Redis, Keycloak, PostgreSQL)
Tải: https://www.docker.com/products/docker-desktop
Chạy installer. Restart máy nếu được yêu cầu.
Yêu cầu hệ thống:
- Windows 10/11 64-bit
- WSL 2 enabled (Docker installer sẽ hướng dẫn bật)
- RAM tối thiểu 8GB (khuyên 16GB)
Kiểm tra:

```
docker --version
docker compose version
```

```
Docker version 27.x.x
Docker Compose version v2.x.x
```

---

## Chạy toàn bộ Infrastructure bằng Docker Compose
Tạo file `docker-compose.yml` ở thư mục gốc project:

```yaml
version: '3.8'

services:

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
      - ./infrastructure/postgres/init-databases.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U iris"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: iris-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  zookeeper:
    image: confluentinc/cp-zookeeper:7.6.0
    container_name: iris-zookeeper
    ports:
      - "2181:2181"
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181

  kafka:
    image: confluentinc/cp-kafka:7.6.0
    container_name: iris-kafka
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
    depends_on:
      - zookeeper

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
    command: start-dev
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  postgres_data:
  redis_data:
```
Tạo file `infrastructure/postgres/init-databases.sql`:

```sql
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
```
Chạy:

```
docker compose up -d
```
Kiểm tra tất cả đã chạy:

```
docker ps
```

```
iris-postgres     0.0.0.0:5432->5432    Up
iris-redis        0.0.0.0:6379->6379    Up
iris-kafka        0.0.0.0:9092->9092    Up
iris-zookeeper    0.0.0.0:2181->2181    Up
iris-keycloak     0.0.0.0:8180->8080    Up
```
Truy cập kiểm tra:
- PostgreSQL: `localhost:5432` (user: `iris` / pass: `iris123`)
- Redis: `localhost:6379`
- Kafka: `localhost:9092`
- Keycloak: http://localhost:8180 (user: `admin` / pass: `admin`)

---

## Cấu hình Keycloak
Mở http://localhost:8180 → đăng nhập `admin` / `admin`
1. **Tạo Realm:**
   - Hover lên "master" ở sidebar → Create realm
   - Realm name: `iris`
   - Create
2. **Tạo Client:**
   - Clients → Create client
   - Client ID: `iris-frontend`
   - Client authentication: OFF (public client)
   - Valid redirect URIs: `http://localhost:4200/*`
   - Web origins: `http://localhost:4200`
   - Save
3. **Tạo Roles** (trong realm `iris`):
   - Realm roles → Create role, tạo lần lượt 9 roles:
   ```
   ADMIN
   RISK_MANAGER
   RISK_ANALYST
   FRAUD_ANALYST
   AML_ANALYST
   COMPLIANCE_OFFICER
   CASE_INVESTIGATOR
   VIEWER
   BUSINESS_USER
   ```
4. **Tạo User test:**
   - Users → Add user
   - Username: `admin@iris.com`
   - Email: `admin@iris.com`
   - First name: `System`
   - Last name: `Admin`
   - Email verified: ON
   - Create
   - Tab Credentials → Set password: `admin123` → Temporary: OFF
   - Tab Role mapping → Assign role → chọn `ADMIN`

---

### IntelliJ IDEA Community (code backend)
Tải: https://www.jetbrains.com/idea/download (chọn Community — miễn phí)
### DBeaver (quản lý database)
Tải: https://dbeaver.io/download
Kết nối:

```
Host:     localhost
Port:     5432
Database: iris_admin (hoặc iris_risk, iris_fraud, ...)
User:     iris
Password: iris123
```
### Postman (test API)
Tải: https://www.postman.com/downloads

---

## Chạy Frontend

```
cd iris-platform
npm install
ng serve
```
Mở: http://localhost:4200

---

## Chạy Backend (từng service)

```
cd iris-backend

mvn clean install -DskipTests

cd iris-discovery
mvn spring-boot:run

cd ../iris-config
mvn spring-boot:run

cd ../iris-gateway
mvn spring-boot:run

cd ../iris-risk-service
mvn spring-boot:run

cd ../iris-fraud-service
mvn spring-boot:run
```
Hoặc chạy tất cả bằng IntelliJ:
- Mở `iris-backend` folder
- Run Configuration → Compound → thêm tất cả `*Application.java`
- Run

---

## Tổng kết ports

```
Service                    Port      URL
──────────────────────────────────────────────────────────
Angular Frontend           4200      http://localhost:4200
API Gateway                8080      http://localhost:8080
Eureka Discovery           8761      http://localhost:8761
Config Server              8888      http://localhost:8888
Risk Service               8081
Fraud Service              8082
AML Service                8083
Case Service               8084
Transaction Service        8085
Alert Service              8086
Model Service              8087
Governance Service         8088
Admin Service              8089
Compliance Service         8090
Report Service             8091
Notification Service       8092
──────────────────────────────────────────────────────────
PostgreSQL                 5432
Redis                      6379
Kafka                      9092
Zookeeper                  2181
Keycloak                   8180      http://localhost:8180
```
---

## Kiểm tra mọi thứ đã hoạt động

```
✅ docker ps                           → 5 containers running
✅ http://localhost:8180                → Keycloak admin console
✅ http://localhost:4200                → IRIS Frontend login page
✅ http://localhost:8761                → Eureka dashboard (khi có backend)
✅ http://localhost:8080/api/risks      → API Gateway proxy (khi có backend)
```

---

Docker containers chiếm khoảng 3-4 GB RAM. 
Mỗi Spring Boot service chiếm 200-400 MB. 
Chạy full 12 services + infra cần khoảng 10-12 GB RAM.

---

## Dừng tất cả

```
docker compose down
```
Dừng nhưng giữ data:

```
docker compose stop
```
Xoá toàn bộ data (reset):

```
docker compose down -v
```
