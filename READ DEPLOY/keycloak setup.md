# IRIS Platform — Keycloak Setup

> Keycloak 24 · Realm: `iris` · Client: `iris-frontend` · 9 Roles · Test Users
>
> Truy cập: http://localhost:8180 · Admin: `admin` / `admin`

---

## Cách 1 — Import realm tự động (khuyên dùng)

Đặt file `iris-realm-export.json` vào `infrastructure/keycloak/`, Docker Compose sẽ tự import khi khởi động.

File `infrastructure/keycloak/iris-realm-export.json`:

```json
{
  "realm": "iris",
  "enabled": true,
  "sslRequired": "external",
  "registrationAllowed": false,
  "loginWithEmailAllowed": true,
  "duplicateEmailsAllowed": false,
  "resetPasswordAllowed": true,
  "editUsernameAllowed": false,
  "bruteForceProtected": true,
  "permanentLockout": false,
  "maxFailureWaitSeconds": 900,
  "maxDeltaTimeSeconds": 43200,
  "failureFactor": 5,
  "accessTokenLifespan": 3600,
  "ssoSessionIdleTimeout": 1800,
  "ssoSessionMaxLifespan": 36000,
  "roles": {
    "realm": [
      { "name": "ADMIN", "description": "Full system access" },
      { "name": "RISK_MANAGER", "description": "Manage risks, approve assessments" },
      { "name": "RISK_ANALYST", "description": "Create and assess risks" },
      { "name": "FRAUD_ANALYST", "description": "Investigate fraud alerts" },
      { "name": "AML_ANALYST", "description": "AML screening and SAR filing" },
      { "name": "COMPLIANCE_OFFICER", "description": "Policies, audits, violations" },
      { "name": "CASE_INVESTIGATOR", "description": "Case investigation and evidence" },
      { "name": "VIEWER", "description": "Read-only access" },
      { "name": "BUSINESS_USER", "description": "Limited operational access" }
    ]
  },
  "clients": [
    {
      "clientId": "iris-frontend",
      "name": "IRIS Platform Frontend",
      "enabled": true,
      "publicClient": true,
      "directAccessGrantsEnabled": true,
      "standardFlowEnabled": true,
      "implicitFlowEnabled": false,
      "redirectUris": [
        "http://localhost:4200/*",
        "http://localhost:4200"
      ],
      "webOrigins": [
        "http://localhost:4200"
      ],
      "protocol": "openid-connect",
      "defaultClientScopes": [
        "openid",
        "profile",
        "email",
        "roles"
      ],
      "protocolMappers": [
        {
          "name": "realm-roles",
          "protocol": "openid-connect",
          "protocolMapper": "oidc-usermodel-realm-role-mapper",
          "config": {
            "claim.name": "realm_access.roles",
            "jsonType.label": "String",
            "multivalued": "true",
            "id.token.claim": "true",
            "access.token.claim": "true",
            "userinfo.token.claim": "true"
          }
        }
      ]
    },
    {
      "clientId": "iris-backend",
      "name": "IRIS Platform Backend",
      "enabled": true,
      "publicClient": false,
      "secret": "iris-backend-secret-2026",
      "bearerOnly": true,
      "protocol": "openid-connect"
    }
  ],
  "users": [
    {
      "username": "admin@iris.com",
      "email": "admin@iris.com",
      "firstName": "System",
      "lastName": "Admin",
      "enabled": true,
      "emailVerified": true,
      "credentials": [{ "type": "password", "value": "admin123", "temporary": false }],
      "realmRoles": ["ADMIN"]
    },
    {
      "username": "risk.mgr@iris.com",
      "email": "risk.mgr@iris.com",
      "firstName": "Trần Thị",
      "lastName": "Rủi Ro",
      "enabled": true,
      "emailVerified": true,
      "credentials": [{ "type": "password", "value": "risk123", "temporary": false }],
      "realmRoles": ["RISK_MANAGER"]
    },
    {
      "username": "fraud@iris.com",
      "email": "fraud@iris.com",
      "firstName": "Lê Minh",
      "lastName": "Phân Tích",
      "enabled": true,
      "emailVerified": true,
      "credentials": [{ "type": "password", "value": "fraud123", "temporary": false }],
      "realmRoles": ["FRAUD_ANALYST"]
    },
    {
      "username": "compliance@iris.com",
      "email": "compliance@iris.com",
      "firstName": "Phạm Hồng",
      "lastName": "Tuân Thủ",
      "enabled": true,
      "emailVerified": true,
      "credentials": [{ "type": "password", "value": "comp123", "temporary": false }],
      "realmRoles": ["COMPLIANCE_OFFICER"]
    },
    {
      "username": "aml@iris.com",
      "email": "aml@iris.com",
      "firstName": "Hoàng Minh",
      "lastName": "AML",
      "enabled": true,
      "emailVerified": true,
      "credentials": [{ "type": "password", "value": "aml123", "temporary": false }],
      "realmRoles": ["AML_ANALYST"]
    },
    {
      "username": "data@iris.com",
      "email": "data@iris.com",
      "firstName": "Vũ Thị",
      "lastName": "Dữ Liệu",
      "enabled": true,
      "emailVerified": true,
      "credentials": [{ "type": "password", "value": "data123", "temporary": false }],
      "realmRoles": ["VIEWER"]
    },
    {
      "username": "auditor@iris.com",
      "email": "auditor@iris.com",
      "firstName": "Đỗ Văn",
      "lastName": "Kiểm Toán",
      "enabled": true,
      "emailVerified": true,
      "credentials": [{ "type": "password", "value": "audit123", "temporary": false }],
      "realmRoles": ["VIEWER"]
    },
    {
      "username": "cro@iris.com",
      "email": "cro@iris.com",
      "firstName": "Bùi Đức",
      "lastName": "Lãnh Đạo",
      "enabled": true,
      "emailVerified": true,
      "credentials": [{ "type": "password", "value": "exec123", "temporary": false }],
      "realmRoles": ["BUSINESS_USER"]
    }
  ]
}
```

---

## Cách 2 — Cấu hình thủ công qua Admin Console

Mở http://localhost:8180 → đăng nhập `admin` / `admin`

### Bước 1 — Tạo Realm

```
1. Sidebar trái → hover lên "master" → Create realm
2. Realm name: iris
3. Enabled: ON
4. Click Create
```

### Bước 2 — Tạo Client (Frontend)

```
1. Sidebar → Clients → Create client
2. Client type: OpenID Connect
3. Client ID: iris-frontend
4. Name: IRIS Platform Frontend
5. Click Next

6. Client authentication: OFF (public client)
7. Authorization: OFF
8. Standard flow: ON
9. Direct access grants: ON
10. Click Next

11. Root URL: http://localhost:4200
12. Valid redirect URIs: http://localhost:4200/*
13. Valid post logout redirect URIs: http://localhost:4200
14. Web origins: http://localhost:4200
15. Click Save
```

### Bước 3 — Tạo Client (Backend)

```
1. Clients → Create client
2. Client ID: iris-backend
3. Client authentication: ON (confidential)
4. Bearer only: enabled trong Advanced Settings
5. Save
6. Tab Credentials → copy Client secret
```

### Bước 4 — Tạo 9 Realm Roles

```
Sidebar → Realm roles → Create role

Tạo lần lượt:
  Name: ADMIN                Description: Full system access
  Name: RISK_MANAGER         Description: Manage risks, approve assessments
  Name: RISK_ANALYST         Description: Create and assess risks
  Name: FRAUD_ANALYST        Description: Investigate fraud alerts
  Name: AML_ANALYST          Description: AML screening and SAR filing
  Name: COMPLIANCE_OFFICER   Description: Policies, audits, violations
  Name: CASE_INVESTIGATOR    Description: Case investigation and evidence
  Name: VIEWER               Description: Read-only access
  Name: BUSINESS_USER        Description: Limited operational access
```

### Bước 5 — Tạo Users

```
Sidebar → Users → Add user

User 1 (Admin):
  Username:       admin@iris.com
  Email:          admin@iris.com
  First name:     System
  Last name:      Admin
  Email verified: ON
  → Create
  → Tab Credentials → Set password: admin123 → Temporary: OFF
  → Tab Role mapping → Assign role → ADMIN

User 2 (Risk Manager):
  Username:       risk.mgr@iris.com
  Email:          risk.mgr@iris.com
  First name:     Trần Thị
  Last name:      Rủi Ro
  → Password: risk123
  → Role: RISK_MANAGER

User 3 (Fraud Analyst):
  Username:       fraud@iris.com
  Email:          fraud@iris.com
  First name:     Lê Minh
  Last name:      Phân Tích
  → Password: fraud123
  → Role: FRAUD_ANALYST

User 4 (Compliance Officer):
  Username:       compliance@iris.com
  Email:          compliance@iris.com
  First name:     Phạm Hồng
  Last name:      Tuân Thủ
  → Password: comp123
  → Role: COMPLIANCE_OFFICER

User 5 (AML Analyst):
  Username:       aml@iris.com
  Email:          aml@iris.com
  First name:     Hoàng Minh
  Last name:      AML
  → Password: aml123
  → Role: AML_ANALYST

User 6 (Data Analyst):
  Username:       data@iris.com
  → Password: data123
  → Role: VIEWER

User 7 (Auditor):
  Username:       auditor@iris.com
  → Password: audit123
  → Role: VIEWER

User 8 (Executive):
  Username:       cro@iris.com
  → Password: exec123
  → Role: BUSINESS_USER
```

### Bước 6 — Cấu hình Role Mapper cho JWT

```
1. Clients → iris-frontend → Client scopes tab
2. Click "iris-frontend-dedicated"
3. Add mapper → By configuration → User Realm Role
4. Name: realm-roles
5. Token Claim Name: realm_access.roles
6. Claim JSON Type: String
7. Add to ID token: ON
8. Add to access token: ON
9. Add to userinfo: ON
10. Save
```

Sau bước này, JWT token sẽ chứa:

```json
{
  "realm_access": {
    "roles": ["ADMIN"]
  },
  "preferred_username": "admin@iris.com",
  "email": "admin@iris.com",
  "given_name": "System",
  "family_name": "Admin"
}
```

---

## Kiểm tra

### Lấy token bằng cURL

```bash
curl -X POST http://localhost:8180/realms/iris/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=iris-frontend" \
  -d "username=admin@iris.com" \
  -d "password=admin123"
```

Response:

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiI...",
  "expires_in": 3600,
  "refresh_token": "eyJhbGciOiJIUzI1NiI...",
  "token_type": "Bearer"
}
```

### Decode JWT tại https://jwt.io

Paste access_token, kiểm tra có `realm_access.roles` chứa role đúng.

---

## Spring Boot cấu hình nhận JWT

```yaml
# application.yml trong mỗi microservice
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://localhost:8180/realms/iris
          jwk-set-uri: http://localhost:8180/realms/iris/protocol/openid-connect/certs
```

```java
// SecurityConfig.java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .cors(cors -> cors.configurationSource(corsConfig()))
        .csrf(csrf -> csrf.disable())
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/actuator/**").permitAll()
            .anyRequest().authenticated()
        )
        .oauth2ResourceServer(oauth2 -> oauth2
            .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthConverter()))
        );
    return http.build();
}
```

---

## Endpoints Keycloak hữu ích

```
Admin Console:    http://localhost:8180/admin
Account Console:  http://localhost:8180/realms/iris/account
OpenID Config:    http://localhost:8180/realms/iris/.well-known/openid-configuration
JWK Set:          http://localhost:8180/realms/iris/protocol/openid-connect/certs
Token endpoint:   http://localhost:8180/realms/iris/protocol/openid-connect/token
Userinfo:         http://localhost:8180/realms/iris/protocol/openid-connect/userinfo
```
