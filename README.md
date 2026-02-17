# IRIS Platform

Hệ thống quản lý rủi ro tài chính toàn diện — phục vụ 11 nghiệp vụ cốt lõi: Risk Management, Fraud Detection, AML Screening, Transaction Monitoring, Case Management, Alert Management, Model Management, Data Governance, Compliance, Analytics, Admin.

**Frontend** chạy độc lập bằng mock data, sẵn sàng kết nối **15 microservices** backend chỉ bằng 1 dòng config.

```
Tech Stack
├── Frontend:   Angular 18 · PrimeNG · D3.js · RxJS · TypeScript · SCSS · i18n (EN/VI)
└── Backend:    Java 17 · Spring Boot 3 · Spring Cloud Gateway · PostgreSQL · Keycloak
                Apache Kafka · Redis · WebSocket · Flyway · Docker · Nginx
```

---

## Tài liệu

```
READ FRONTEND/           Dành cho frontend developer
├── frontend structure.md  Cây file chi tiết khi mở VSCode + lệnh chạy + tương thích backend
└── mock data.md           8 tài khoản demo, 497 mock objects, quan hệ dữ liệu, luồng test

READ BACKEND/            Dành cho backend developer
├── backend structure.md   Cấu trúc 15 microservices, từng file Java
├── api contracts.md       278 endpoints, request/response, HTTP methods, path params
├── database schema.md     73 bảng SQL, DDL chi tiết, indexes, constraints, seed data
└── kafka events.md        20 topics, 66 partitions, payload JSON, producer/consumer mapping

READ DEPLOY/             Dành cho DevOps / người cài đặt
├── docker compose.md      8 containers, tự tạo 12 databases + 20 Kafka topics khi khởi động
├── keycloak setup.md      Realm iris, 9 roles, 8 users, JWT config, realm export JSON
└── environment window.md  Cài đặt toàn bộ môi trường trên Windows từ đầu

```

---

## Chạy nhanh (chỉ Frontend)

```bash
cd iris-platform
npm install
npx ng serve
```

Mở http://localhost:4200 — đăng nhập bất kỳ email/password nào.
