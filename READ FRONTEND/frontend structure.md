# IRIS Platform — Frontend

> Angular 18 · Standalone Components · D3.js · PrimeNG · i18n (EN/VI)
>
> Financial Risk Management — 11 Modules · 58 Detail Tabs · 9 Roles · 127 API Endpoints

---

## Cấu trúc khi mở bằng VSCode
Mở folder bằng VSCode, bạn sẽ thấy:

```
iris-platform/
├── .editorconfig
├── .gitignore
├── .vscode/
│   ├── extensions.json
│   ├── launch.json
│   └── tasks.json
├── angular.json
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.spec.json
├── public/
│   ├── favicon.ico
│   └── assets/
│       └── images/
│           ├── ai-model-bg.png
│           ├── aml-screening-bg.png
│           ├── avatar-default.png
│           ├── case-management-bg.png
│           ├── compliance-bg.png
│           ├── data-analytics-bg.png
│           ├── fraud-detection-bg.png
│           ├── hero-banner.png
│           ├── login-bg.jpg.png
│           ├── logo.png
│           └── risk-management-bg.png
└── src/
    ├── index.html
    ├── main.ts
    ├── styles.scss
    ├── environments/
    │   ├── environment.ts
    │   └── environment.prod.ts
    ├── assets/
    │   ├── i18n/
    │   │   ├── en.json
    │   │   └── vi.json
    │   └── images/
    │       ├── ai-model-bg.png
    │       ├── aml-screening-bg.png
    │       ├── avatar-default.png
    │       ├── case-management-bg.png
    │       ├── compliance-bg.png
    │       ├── data-analytics-bg.png
    │       ├── fraud-detection-bg.png
    │       ├── hero-banner.png
    │       ├── login-bg.jpg.png
    │       ├── logo.png
    │       └── risk-management-bg.png
    └── app/
        ├── app.component.html
        ├── app.component.scss
        ├── app.component.ts
        ├── app.config.ts
        ├── app.routes.ts
        ├── core/
        │   ├── auth/
        │   │   └── auth.service.ts
        │   ├── guards/
        │   │   ├── auth.guard.ts
        │   │   └── role.guard.ts
        │   ├── interceptors/
        │   │   ├── auth.interceptor.ts
        │   │   ├── error.interceptor.ts
        │   │   └── loading.interceptor.ts
        │   ├── models/
        │   │   └── index.ts
        │   └── services/
        │       ├── api/
        │       │   ├── api-base.service.ts
        │       │   ├── risk-api.service.ts
        │       │   ├── fraud-api.service.ts
        │       │   ├── aml-api.service.ts
        │       │   ├── transaction-api.service.ts
        │       │   ├── case-mgmt-api.service.ts
        │       │   ├── alert-api.service.ts
        │       │   ├── model-api.service.ts
        │       │   ├── governance-api.service.ts
        │       │   ├── compliance-api.service.ts
        │       │   ├── admin-api.service.ts
        │       │   └── report-api.service.ts
        │       ├── file-upload.service.ts
        │       ├── interaction.service.ts
        │       ├── loading.service.ts
        │       ├── mock-data.service.ts
        │       └── websocket.service.ts
        ├── shared/
        │   ├── layouts/
        │   │   └── main-layout.component.ts
        │   ├── components/
        │   │   ├── breadcrumb/
        │   │   │   └── breadcrumb.component.ts
        │   │   ├── confirm-dialog/
        │   │   │   └── confirm-dialog.component.ts
        │   │   ├── empty-state/
        │   │   │   └── empty-state.component.ts
        │   │   ├── file-upload/
        │   │   │   └── file-upload.component.ts
        │   │   ├── loading/
        │   │   │   └── loading.component.ts
        │   │   ├── notification-center/
        │   │   │   └── notification-center.component.ts
        │   │   ├── skeleton/
        │   │   │   └── skeleton.component.ts
        │   │   ├── detail-panel.component.ts
        │   │   └── toast.component.ts
        │   ├── directives/
        │   └── pipes/
        ├── features/
        │   ├── dashboard/
        │   │   └── dashboard.component.ts
        │   ├── risk-management/
        │   │   └── risk-management.component.ts
        │   ├── fraud-detection/
        │   │   └── fraud-detection.component.ts
        │   ├── aml-screening/
        │   │   └── aml-screening.component.ts
        │   ├── transaction-monitoring/
        │   │   └── transaction-monitoring.component.ts
        │   ├── case-management/
        │   │   └── case-management.component.ts
        │   ├── analytics/
        │   │   └── analytics.component.ts
        │   ├── alert-management/
        │   │   └── alert-management.component.ts
        │   ├── model-management/
        │   │   └── model-management.component.ts
        │   ├── data-governance/
        │   │   └── data-governance.component.ts
        │   ├── compliance/
        │   │   └── compliance.component.ts
        │   └── admin/
        │       └── admin.component.ts
        └── pages/
            ├── login/
            │   └── login.component.ts
            ├── profile/
            │   └── profile.component.ts
            ├── settings/
            │   └── settings.component.ts
            ├── help/
            │   └── help.component.ts
            └── unauthorized/
                └── unauthorized.component.ts
```
**54 file TypeScript · 31 model interfaces · 11 images · 2 i18n files**

---

## Cài đặt và chạy
Mở Terminal trong VSCode 

```bash
npm install
```
Sau lệnh này, thư mục `node_modules/` được sinh ra (~300MB):

```
iris-platform/
├── node_modules/          ← SINH RA
│   └── ... (~1000 packages)
├── package-lock.json      ← CẬP NHẬT
└── (tất cả file gốc giữ nguyên)
```
Chạy dev server:

```bash
ng serve
```
Sau lệnh này, thư mục `.angular/` (cache) được sinh ra:

```
iris-platform/
├── .angular/              ← SINH RA (build cache)
│   └── cache/
└── ...
```
Mở trình duyệt: **http://localhost:4200**
Đăng nhập với bất kỳ email/password nào (mock auth, luôn thành công).

---

Build production:

```bash
npx ng build
```
Thư mục `dist/` được sinh ra:

```
iris-platform/
├── dist/                  ← SINH RA
│   └── iris-platform/
│       └── browser/
│           ├── index.html
│           ├── main-XXXXXXXX.js
│           ├── polyfills-XXXXXXXX.js
│           ├── styles-XXXXXXXX.css
│           ├── chunk-*.js (22 lazy-loaded chunks)
│           ├── favicon.ico
│           ├── assets/
│           │   └── images/
│           └── media/
└── ...
```

Deploy: copy toàn bộ nội dung `dist/iris-platform/browser/` lên web server bất kỳ (Nginx, Apache, S3...).

---