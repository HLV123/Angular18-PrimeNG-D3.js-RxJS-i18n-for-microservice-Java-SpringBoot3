import { Injectable } from '@angular/core';
import {
  Risk, RiskLevel, RiskCategory, RiskStatus, TreatmentStrategy, ControlType,
  Transaction, TransactionType, TransactionChannel, TransactionStatus,
  FraudAlert, FraudRule, AlertPriority, AlertStatus, AlertType, Alert,
  AMLAlert, CustomerRisk, KYCStatus, SanctionMatchStatus, SAR,
  Case, CaseStatus, CaseType, CaseNote,
  MLModel, ModelStatus,
  DataAsset, DataQualityRule,
  Policy, AuditFinding, AuditProject, ComplianceFramework,
  AuditLog, SystemHealth, User, UserRole, Notification,
  KRI, ActionPlan, Control, HeatMapData, TimeSeriesData, DashboardStats
} from '../models';

@Injectable({ providedIn: 'root' })
export class MockDataService {

  // ===================== USERS =====================
  private users: User[] = [
    { id: 'U001', username: 'admin', email: 'admin@iris.com', fullName: 'Nguyễn Văn Admin', firstName: 'Admin', lastName: 'Nguyễn', department: 'IT', role: UserRole.SYSTEM_ADMIN, roles: [UserRole.SYSTEM_ADMIN], status: 'ACTIVE', lastLogin: new Date('2026-02-15T08:00:00'), createdAt: new Date('2024-01-01'), permissions: ['*'], title: 'System Administrator', phone: '0901234567' },
    { id: 'U002', username: 'riskmanager', email: 'risk.mgr@iris.com', fullName: 'Trần Thị Rủi Ro', firstName: 'Ro', lastName: 'Trần', department: 'Risk Management', role: UserRole.RISK_MANAGER, roles: [UserRole.RISK_MANAGER], status: 'ACTIVE', lastLogin: new Date('2026-02-15T07:30:00'), createdAt: new Date('2024-02-01'), permissions: ['risk.*'], title: 'Chief Risk Officer', phone: '0902345678' },
    { id: 'U003', username: 'fraudanalyst', email: 'fraud@iris.com', fullName: 'Lê Minh Phân Tích', firstName: 'Tích', lastName: 'Lê', department: 'Fraud Prevention', role: UserRole.FRAUD_ANALYST, roles: [UserRole.FRAUD_ANALYST], status: 'ACTIVE', lastLogin: new Date('2026-02-15T09:00:00'), createdAt: new Date('2024-03-01'), permissions: ['fraud.*', 'alert.*'], title: 'Senior Fraud Analyst', phone: '0903456789' },
    { id: 'U004', username: 'compliance', email: 'compliance@iris.com', fullName: 'Phạm Hồng Tuân Thủ', firstName: 'Thủ', lastName: 'Phạm', department: 'Compliance', role: UserRole.COMPLIANCE_OFFICER, roles: [UserRole.COMPLIANCE_OFFICER], status: 'ACTIVE', lastLogin: new Date('2026-02-14T16:00:00'), createdAt: new Date('2024-04-01'), permissions: ['compliance.*', 'audit.*'], title: 'Compliance Manager', phone: '0904567890' },
    { id: 'U005', username: 'amlofficer', email: 'aml@iris.com', fullName: 'Hoàng Minh AML', firstName: 'AML', lastName: 'Hoàng', department: 'AML', role: UserRole.AML_OFFICER, roles: [UserRole.AML_OFFICER], status: 'ACTIVE', lastLogin: new Date('2026-02-15T08:30:00'), createdAt: new Date('2024-05-01'), permissions: ['aml.*'], title: 'AML Officer', phone: '0905678901' },
    { id: 'U006', username: 'dataanalyst', email: 'data@iris.com', fullName: 'Vũ Thị Dữ Liệu', firstName: 'Liệu', lastName: 'Vũ', department: 'Data Analytics', role: UserRole.DATA_ANALYST, roles: [UserRole.DATA_ANALYST], status: 'ACTIVE', lastLogin: new Date('2026-02-15T07:00:00'), createdAt: new Date('2024-06-01'), permissions: ['analytics.*', 'model.*'], title: 'Data Scientist', phone: '0906789012' },
    { id: 'U007', username: 'auditor', email: 'auditor@iris.com', fullName: 'Đỗ Văn Kiểm Toán', firstName: 'Toán', lastName: 'Đỗ', department: 'Internal Audit', role: UserRole.AUDITOR, roles: [UserRole.AUDITOR], status: 'ACTIVE', lastLogin: new Date('2026-02-14T15:00:00'), createdAt: new Date('2024-07-01'), permissions: ['audit.*'], title: 'Internal Auditor', phone: '0907890123' },
    { id: 'U008', username: 'executive', email: 'cro@iris.com', fullName: 'Bùi Đức Lãnh Đạo', firstName: 'Đạo', lastName: 'Bùi', department: 'Executive', role: UserRole.EXECUTIVE, roles: [UserRole.EXECUTIVE], status: 'ACTIVE', lastLogin: new Date('2026-02-15T10:00:00'), createdAt: new Date('2024-01-01'), permissions: ['dashboard.*', 'report.*'], title: 'CRO', phone: '0908901234' },
  ];

  // ===================== CREDENTIALS =====================
  private credentials: { username: string; password: string; userId: string }[] = [
    { username: 'admin', password: 'admin123', userId: 'U001' },
    { username: 'riskmanager', password: 'risk123', userId: 'U002' },
    { username: 'fraudanalyst', password: 'fraud123', userId: 'U003' },
    { username: 'compliance', password: 'comp123', userId: 'U004' },
    { username: 'amlofficer', password: 'aml123', userId: 'U005' },
    { username: 'dataanalyst', password: 'data123', userId: 'U006' },
    { username: 'auditor', password: 'audit123', userId: 'U007' },
    { username: 'executive', password: 'exec123', userId: 'U008' },
  ];

  // ===================== RISKS =====================
  private risks: Risk[] = Array.from({ length: 45 }, (_, i) => {
    const cats = Object.values(RiskCategory);
    const depts = ['Finance', 'IT', 'Operations', 'Sales', 'HR', 'Legal', 'Marketing'];
    const statuses = Object.values(RiskStatus);
    const treatments = Object.values(TreatmentStrategy);
    const likelihood = Math.floor(Math.random() * 5) + 1;
    const impact = Math.floor(Math.random() * 5) + 1;
    const score = likelihood * impact;
    const level = score >= 20 ? RiskLevel.CRITICAL : score >= 12 ? RiskLevel.HIGH : score >= 6 ? RiskLevel.MEDIUM : RiskLevel.LOW;
    const controlEff = Math.floor(Math.random() * 60) + 30;
    const residual = Math.round(score * (1 - controlEff / 100));
    const titles = [
      'Cybersecurity Breach Risk', 'Market Volatility Exposure', 'Regulatory Non-Compliance', 'Data Privacy Violation',
      'Operational System Failure', 'Credit Default Risk', 'Liquidity Crisis', 'Vendor Dependency Risk',
      'Fraud Scheme Exposure', 'Reputational Damage', 'Interest Rate Risk', 'Foreign Exchange Risk',
      'Technology Obsolescence', 'Talent Retention Risk', 'Business Continuity Risk', 'Anti-Money Laundering Gap',
      'Insider Threat Risk', 'Supply Chain Disruption', 'Geopolitical Risk', 'Climate Change Impact',
      'Digital Transformation Risk', 'Third-Party API Failure', 'Social Engineering Attack', 'Ransomware Threat',
      'Patent Infringement Risk', 'Customer Attrition Risk', 'Pricing Model Risk', 'Derivative Exposure',
      'Cloud Infrastructure Risk', 'AI/ML Model Bias', 'Sanctions Violation Risk', 'Tax Compliance Risk',
      'Data Quality Degradation', 'Network Outage Risk', 'Payment Processing Failure', 'Cross-Border Transaction Risk',
      'Employee Misconduct', 'Product Liability Risk', 'Environmental Compliance', 'Mergers & Acquisitions Risk',
      'Strategic Misalignment', 'Capital Adequacy Risk', 'Counterparty Default', 'Model Validation Gap', 'Audit Finding Exposure'
    ];
    return {
      id: `RSK-${String(i + 1).padStart(4, '0')}`,
      title: titles[i],
      description: `Detailed description for ${titles[i]}. This risk needs to be monitored and controlled effectively.`,
      category: cats[i % cats.length],
      department: depts[i % depts.length],
      owner: this.users[i % this.users.length]?.id || 'U002',
      ownerName: this.users[i % this.users.length]?.fullName || 'N/A',
      status: i < 40 ? RiskStatus.ACTIVE : statuses[i % statuses.length],
      likelihood, impact, inherentScore: score, residualScore: residual, riskLevel: level,
      velocity: ['Immediate', 'Days', 'Weeks', 'Months', 'Years'][Math.floor(Math.random() * 5)],
      appetite: Math.floor(Math.random() * 10) + 5,
      controlEffectiveness: controlEff,
      treatmentStrategy: treatments[i % treatments.length],
      actionPlans: this.generateActionPlans(i),
      controls: this.generateControls(i),
      kris: this.generateKRIs(i),
      createdAt: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      updatedAt: new Date(2026, 1, Math.floor(Math.random() * 15) + 1),
    };
  });

  private generateActionPlans(seed: number): ActionPlan[] {
    const statuses: ActionPlan['status'][] = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE'];
    return Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, j) => ({
      id: `AP-${seed}-${j}`,
      description: `Action plan ${j + 1}: Implement mitigation measures`,
      responsible: this.users[j % this.users.length]?.fullName || 'TBD',
      dueDate: new Date(2026, Math.floor(Math.random() * 6) + 2, Math.floor(Math.random() * 28) + 1),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      completion: Math.floor(Math.random() * 100),
    }));
  }

  private generateControls(seed: number): Control[] {
    const types = Object.values(ControlType);
    return Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, j) => ({
      id: `CTL-${seed}-${j}`,
      description: `Control measure ${j + 1} for risk mitigation`,
      type: types[j % types.length],
      effectiveness: Math.floor(Math.random() * 50) + 50,
      testFrequency: ['Monthly', 'Quarterly', 'Semi-Annual', 'Annual'][Math.floor(Math.random() * 4)],
      lastTestDate: new Date(2026, 0, Math.floor(Math.random() * 31) + 1),
      lastTestResult: (['PASS', 'FAIL', 'PARTIAL'] as Control['lastTestResult'][])[Math.floor(Math.random() * 3)],
    }));
  }

  private generateKRIs(seed: number): KRI[] {
    const kriNames = ['Transaction Volume', 'Error Rate', 'Loss Ratio', 'Incident Count', 'Response Time'];
    return Array.from({ length: Math.floor(Math.random() * 2) + 1 }, (_, j) => ({
      id: `KRI-${seed}-${j}`,
      name: kriNames[j % kriNames.length],
      description: `Key risk indicator ${j + 1}`,
      currentValue: Math.floor(Math.random() * 100),
      warningThreshold: 70,
      criticalThreshold: 90,
      trend: (['UP', 'DOWN', 'STABLE'] as KRI['trend'][])[Math.floor(Math.random() * 3)],
      unit: ['%', 'count', 'USD', 'ms'][Math.floor(Math.random() * 4)],
      history: Array.from({ length: 12 }, (_, k) => ({
        date: new Date(2025, k, 15),
        value: Math.floor(Math.random() * 100),
      })),
    }));
  }

  // ===================== TRANSACTIONS =====================
  private transactions: Transaction[] = Array.from({ length: 200 }, (_, i) => {
    const types = Object.values(TransactionType);
    const channels = Object.values(TransactionChannel);
    const statuses = Object.values(TransactionStatus);
    const merchants = ['Amazon', 'Shopee', 'Grab', 'Lazada', 'Tiki', 'FPT Shop', 'Thế Giới Di Động', 'Viettel', 'Vingroup', 'Circle K', 'Highland Coffee', 'Starbucks VN'];
    const countries = ['VN', 'US', 'SG', 'JP', 'KR', 'TH', 'MY', 'CN', 'UK', 'DE'];
    const amount = Math.round((Math.random() * 50000 + 10) * 100) / 100;
    const fraudScore = Math.floor(Math.random() * 1000);
    const level = fraudScore >= 800 ? RiskLevel.CRITICAL : fraudScore >= 600 ? RiskLevel.HIGH : fraudScore >= 300 ? RiskLevel.MEDIUM : RiskLevel.LOW;
    return {
      id: `TXN-${String(i + 1).padStart(6, '0')}`,
      timestamp: new Date(2026, 1, Math.floor(Math.random() * 15) + 1, Math.floor(Math.random() * 24), Math.floor(Math.random() * 60)),
      customerId: `CUS-${String(Math.floor(Math.random() * 50) + 1).padStart(4, '0')}`,
      customerName: ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D', 'Hoàng Văn E', 'Vũ Thị F', 'Đặng Văn G', 'Bùi Thị H'][Math.floor(Math.random() * 8)],
      accountId: `ACC-${String(Math.floor(Math.random() * 100) + 1).padStart(6, '0')}`,
      type: types[Math.floor(Math.random() * types.length)],
      amount,
      currency: 'USD',
      merchant: merchants[Math.floor(Math.random() * merchants.length)],
      channel: channels[Math.floor(Math.random() * channels.length)],
      location: ['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Hải Phòng', 'Singapore', 'Tokyo', 'Seoul'][Math.floor(Math.random() * 7)],
      country: countries[Math.floor(Math.random() * countries.length)],
      latitude: 10.8 + Math.random() * 10,
      longitude: 106.6 + Math.random() * 5,
      fraudScore, riskLevel: level,
      status: fraudScore > 700 ? TransactionStatus.BLOCKED : fraudScore > 500 ? TransactionStatus.UNDER_REVIEW : TransactionStatus.APPROVED,
      ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    };
  });

  // ===================== FRAUD ALERTS =====================
  private fraudAlerts: FraudAlert[] = Array.from({ length: 80 }, (_, i) => {
    const priorities = Object.values(AlertPriority);
    const statuses = Object.values(AlertStatus);
    const ruleNames = ['Unusual Amount', 'New Device', 'Foreign Location', 'Velocity Exceeded', 'Card Not Present', 'Suspicious IP', 'Account Takeover Pattern', 'Rapid Fund Movement'];
    const alertTypes = ['Transaction Fraud', 'Card Fraud', 'Account Takeover', 'Identity Theft', 'Phishing', 'SIM Swap'];
    return {
      id: `FA-${String(i + 1).padStart(5, '0')}`,
      createdAt: new Date(2026, 1, Math.floor(Math.random() * 15) + 1, Math.floor(Math.random() * 24), Math.floor(Math.random() * 60)),
      customerId: `CUS-${String(Math.floor(Math.random() * 50) + 1).padStart(4, '0')}`,
      customerName: ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D', 'Hoàng Văn E'][Math.floor(Math.random() * 5)],
      transactionId: `TXN-${String(Math.floor(Math.random() * 200) + 1).padStart(6, '0')}`,
      alertType: alertTypes[Math.floor(Math.random() * alertTypes.length)],
      fraudScore: Math.floor(Math.random() * 500) + 500,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      assignedTo: i % 3 === 0 ? undefined : `U00${(i % 3) + 2}`,
      assignedToName: i % 3 === 0 ? undefined : ['Trần Thị Rủi Ro', 'Lê Minh Phân Tích', 'Phạm Hồng Tuân Thủ'][i % 3],
      age: Math.floor(Math.random() * 72),
      slaDeadline: new Date(2026, 1, 16 + Math.floor(Math.random() * 5)),
      ruleTriggered: ruleNames[Math.floor(Math.random() * ruleNames.length)],
      description: `Suspicious activity detected - ${ruleNames[Math.floor(Math.random() * ruleNames.length)]}`,
      amount: Math.round(Math.random() * 25000 + 100),
      channel: Object.values(TransactionChannel)[Math.floor(Math.random() * 5)],
    };
  });

  // ===================== CASES =====================
  private cases: Case[] = Array.from({ length: 35 }, (_, i) => {
    const types = Object.values(CaseType);
    const statuses = Object.values(CaseStatus);
    const priorities = Object.values(AlertPriority);
    return {
      id: `CASE-${String(2024001 + i)}`,
      title: ['Account Takeover Investigation', 'Card Fraud Ring', 'Identity Theft Case', 'Money Laundering Scheme', 'Insider Trading Alert', 'Phishing Campaign', 'SIM Swap Fraud', 'Unauthorized Wire Transfer'][i % 8],
      type: types[i % types.length],
      status: statuses[i % statuses.length],
      priority: priorities[i % priorities.length],
      customerId: `CUS-${String(i + 1).padStart(4, '0')}`,
      customerName: ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D', 'Hoàng Văn E'][i % 5],
      assignedTo: `U00${(i % 3) + 3}`,
      assignedToName: ['Lê Minh Phân Tích', 'Phạm Hồng Tuân Thủ', 'Hoàng Minh AML'][i % 3],
      fraudAmount: Math.round(Math.random() * 100000 + 1000),
      recoveryAmount: Math.round(Math.random() * 50000),
      description: `Investigation case for suspicious activities detected in customer account`,
      openDate: new Date(2026, 0, Math.floor(Math.random() * 31) + 1),
      slaDeadline: new Date(2026, 2, Math.floor(Math.random() * 28) + 1),
      alertCount: Math.floor(Math.random() * 10) + 1,
      transactionCount: Math.floor(Math.random() * 20) + 1,
      documentCount: Math.floor(Math.random() * 15),
    };
  });

  // ===================== AML ALERTS =====================
  private amlAlerts: AMLAlert[] = Array.from({ length: 40 }, (_, i) => ({
    id: `AML-${String(i + 1).padStart(5, '0')}`,
    customerId: `CUS-${String(Math.floor(Math.random() * 50) + 1).padStart(4, '0')}`,
    customerName: ['Công ty ABC', 'Nguyễn Văn X', 'Trần Corp', 'Lê Holdings', 'Phạm Trading'][i % 5],
    riskScore: Math.floor(Math.random() * 60) + 40,
    scenario: ['Structuring', 'Rapid Movement of Funds', 'Round Dollar Amounts', 'High Risk Country', 'Unusual Cross-Border', 'Large Cash Transaction'][Math.floor(Math.random() * 6)],
    status: Object.values(AlertStatus)[Math.floor(Math.random() * 5)],
    priority: Object.values(AlertPriority)[Math.floor(Math.random() * 3)],
    createdAt: new Date(2026, 1, Math.floor(Math.random() * 15) + 1),
    assignedTo: i % 2 === 0 ? 'U005' : undefined,
    transactionCount: Math.floor(Math.random() * 20) + 1,
    totalAmount: Math.round(Math.random() * 500000 + 5000),
  }));

  // ===================== CUSTOMER RISK =====================
  private customerRisks: CustomerRisk[] = Array.from({ length: 50 }, (_, i) => ({
    id: `CUS-${String(i + 1).padStart(4, '0')}`,
    name: i % 3 === 0 ? `Công ty ${['Alpha', 'Beta', 'Gamma', 'Delta', 'Omega'][i % 5]}` : `${['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng'][i % 5]} ${['Văn', 'Thị', 'Minh', 'Hồng', 'Đức'][i % 5]} ${['An', 'Bình', 'Cường', 'Dung', 'Em'][i % 5]}`,
    type: i % 3 === 0 ? 'BUSINESS' : 'INDIVIDUAL',
    riskScore: Math.floor(Math.random() * 100),
    riskCategory: [RiskLevel.LOW, RiskLevel.MEDIUM, RiskLevel.HIGH, RiskLevel.CRITICAL][Math.floor(Math.random() * 4)],
    isPEP: Math.random() > 0.85,
    kycStatus: Object.values(KYCStatus)[Math.floor(Math.random() * 4)],
    countryRisk: [RiskLevel.LOW, RiskLevel.MEDIUM, RiskLevel.HIGH][Math.floor(Math.random() * 3)],
    lastReviewDate: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
    nextReviewDue: new Date(2026, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
    accountCount: Math.floor(Math.random() * 5) + 1,
    sanctions: Math.random() > 0.9 ? [{ id: `SM-${i}`, listSource: 'OFAC', matchScore: Math.floor(Math.random() * 40) + 60, matchedName: 'Similar Name', status: SanctionMatchStatus.POSSIBLE_MATCH }] : [],
  }));

  // ===================== ML MODELS =====================
  private mlModels: MLModel[] = [
    { id: 'MDL-001', name: 'Fraud Detection XGBoost v3', type: 'CLASSIFICATION', useCase: 'Fraud Detection', algorithm: 'XGBoost', version: '3.2.1', status: ModelStatus.PRODUCTION, accuracy: 0.956, precision: 0.923, recall: 0.891, f1Score: 0.907, auc: 0.968, owner: 'U006', createdAt: new Date('2025-06-15'), updatedAt: new Date('2026-01-20'), predictionCount: 1250000, avgLatency: 12 },
    { id: 'MDL-002', name: 'AML Risk Scoring RF', type: 'CLASSIFICATION', useCase: 'AML', algorithm: 'Random Forest', version: '2.1.0', status: ModelStatus.PRODUCTION, accuracy: 0.934, precision: 0.912, recall: 0.876, f1Score: 0.894, auc: 0.952, owner: 'U006', createdAt: new Date('2025-08-01'), updatedAt: new Date('2026-01-15'), predictionCount: 890000, avgLatency: 8 },
    { id: 'MDL-003', name: 'Transaction Anomaly Detector', type: 'ANOMALY_DETECTION', useCase: 'Transaction Monitoring', algorithm: 'Isolation Forest', version: '1.5.0', status: ModelStatus.PRODUCTION, accuracy: 0.921, precision: 0.887, recall: 0.856, f1Score: 0.871, auc: 0.943, owner: 'U006', createdAt: new Date('2025-09-10'), updatedAt: new Date('2026-02-01'), predictionCount: 2100000, avgLatency: 5 },
    { id: 'MDL-004', name: 'Credit Risk Neural Net', type: 'REGRESSION', useCase: 'Credit Scoring', algorithm: 'Neural Network', version: '4.0.0-beta', status: ModelStatus.TESTING, accuracy: 0.945, precision: 0.918, recall: 0.902, f1Score: 0.910, auc: 0.961, owner: 'U006', createdAt: new Date('2026-01-05'), updatedAt: new Date('2026-02-10'), predictionCount: 50000, avgLatency: 25 },
    { id: 'MDL-005', name: 'Customer Segmentation KMeans', type: 'CLUSTERING', useCase: 'Customer Analytics', algorithm: 'K-Means', version: '1.2.0', status: ModelStatus.PRODUCTION, accuracy: 0.889, precision: 0.854, recall: 0.832, f1Score: 0.843, auc: 0.912, owner: 'U006', createdAt: new Date('2025-11-20'), updatedAt: new Date('2026-01-30'), predictionCount: 500000, avgLatency: 15 },
    { id: 'MDL-006', name: 'Fraud Ring Detection GNN', type: 'CLASSIFICATION', useCase: 'Network Analysis', algorithm: 'Graph Neural Network', version: '1.0.0', status: ModelStatus.DEVELOPMENT, accuracy: 0.878, precision: 0.845, recall: 0.812, f1Score: 0.828, auc: 0.901, owner: 'U006', createdAt: new Date('2026-02-01'), updatedAt: new Date('2026-02-14'), predictionCount: 10000, avgLatency: 45 },
  ];

  // ===================== DATA ASSETS =====================
  private dataAssets: DataAsset[] = [
    { id: 'DA-001', name: 'transactions', type: 'TABLE', source: 'PostgreSQL - Main DB', owner: 'U006', classification: 'CONFIDENTIAL', qualityScore: 95, tags: ['transactions', 'financial', 'core'], description: 'Core transaction table', lastUpdated: new Date() },
    { id: 'DA-002', name: 'customers', type: 'TABLE', source: 'PostgreSQL - Main DB', owner: 'U006', classification: 'PII', qualityScore: 92, tags: ['customers', 'PII', 'core'], description: 'Customer master data', lastUpdated: new Date() },
    { id: 'DA-003', name: 'fraud_alerts', type: 'TABLE', source: 'PostgreSQL - Main DB', owner: 'U003', classification: 'CONFIDENTIAL', qualityScore: 98, tags: ['fraud', 'alerts'], description: 'Fraud alert records', lastUpdated: new Date() },
    { id: 'DA-004', name: 'kafka_transactions', type: 'STREAM', source: 'Apache Kafka', owner: 'U001', classification: 'INTERNAL', qualityScore: 99, tags: ['kafka', 'streaming'], description: 'Real-time transaction stream', lastUpdated: new Date() },
    { id: 'DA-005', name: 'risk_assessments', type: 'TABLE', source: 'PostgreSQL - Risk DB', owner: 'U002', classification: 'INTERNAL', qualityScore: 91, tags: ['risk', 'assessment'], description: 'Risk assessment records', lastUpdated: new Date() },
    { id: 'DA-006', name: 'sanctions_lists', type: 'FILE', source: 'External Import', owner: 'U005', classification: 'RESTRICTED', qualityScore: 88, tags: ['sanctions', 'AML', 'compliance'], description: 'Consolidated sanctions lists', lastUpdated: new Date() },
    { id: 'DA-007', name: 'model_predictions', type: 'TABLE', source: 'Elasticsearch', owner: 'U006', classification: 'INTERNAL', qualityScore: 96, tags: ['ML', 'predictions'], description: 'ML model prediction results', lastUpdated: new Date() },
    { id: 'DA-008', name: 'audit_logs', type: 'TABLE', source: 'PostgreSQL - Audit DB', owner: 'U001', classification: 'RESTRICTED', qualityScore: 100, tags: ['audit', 'logs'], description: 'System audit trail', lastUpdated: new Date() },
  ];

  // ===================== POLICIES =====================
  private policies: Policy[] = [
    { id: 'POL-001', name: 'Anti-Money Laundering Policy', category: 'AML', description: 'Comprehensive AML policy', version: '3.0', effectiveDate: new Date('2025-01-01'), reviewDate: new Date('2026-01-01'), owner: 'U004', status: 'PUBLISHED', framework: ComplianceFramework.BASEL_III },
    { id: 'POL-002', name: 'Data Privacy Policy', category: 'Privacy', description: 'GDPR compliance policy', version: '2.1', effectiveDate: new Date('2025-03-01'), reviewDate: new Date('2026-03-01'), owner: 'U004', status: 'PUBLISHED', framework: ComplianceFramework.GDPR },
    { id: 'POL-003', name: 'Fraud Prevention Policy', category: 'Fraud', description: 'Fraud prevention framework', version: '4.0', effectiveDate: new Date('2025-06-01'), reviewDate: new Date('2026-06-01'), owner: 'U003', status: 'PUBLISHED', framework: ComplianceFramework.PCI_DSS },
    { id: 'POL-004', name: 'IT Security Policy', category: 'Security', description: 'Information security policy', version: '5.2', effectiveDate: new Date('2025-02-01'), reviewDate: new Date('2026-02-01'), owner: 'U001', status: 'REVIEW', framework: ComplianceFramework.ISO_27001 },
    { id: 'POL-005', name: 'Risk Management Framework', category: 'Risk', description: 'Enterprise risk management', version: '2.0', effectiveDate: new Date('2025-04-01'), reviewDate: new Date('2026-04-01'), owner: 'U002', status: 'PUBLISHED', framework: ComplianceFramework.SOX },
  ];

  // ===================== AUDIT PROJECTS =====================
  private auditProjects: AuditProject[] = [
    { id: 'AUD-001', name: 'Q1 2026 Internal Audit', type: 'INTERNAL', status: 'IN_PROGRESS', auditor: 'U007', startDate: new Date('2026-01-15'), endDate: new Date('2026-03-31'), scope: 'All departments', findingCount: 8 },
    { id: 'AUD-002', name: 'Regulatory Compliance Review', type: 'REGULATORY', status: 'PLANNED', auditor: 'External', startDate: new Date('2026-04-01'), endDate: new Date('2026-05-15'), scope: 'AML, Fraud Prevention', findingCount: 0 },
    { id: 'AUD-003', name: 'IT Security Audit', type: 'EXTERNAL', status: 'COMPLETED', auditor: 'PwC', startDate: new Date('2025-10-01'), endDate: new Date('2025-12-15'), scope: 'IT Infrastructure', findingCount: 12 },
  ];

  // ===================== SYSTEM HEALTH =====================
  private systemHealthData: SystemHealth[] = [
    { service: 'Spring Boot API', status: 'UP', cpu: 45, memory: 62, disk: 34, responseTime: 120, lastCheck: new Date() },
    { service: 'PostgreSQL', status: 'UP', cpu: 30, memory: 55, disk: 48, responseTime: 8, lastCheck: new Date() },
    { service: 'Apache Kafka', status: 'UP', cpu: 25, memory: 40, disk: 22, responseTime: 3, lastCheck: new Date() },
    { service: 'Apache Spark', status: 'UP', cpu: 60, memory: 75, disk: 30, responseTime: 250, lastCheck: new Date() },
    { service: 'Elasticsearch', status: 'UP', cpu: 35, memory: 68, disk: 55, responseTime: 15, lastCheck: new Date() },
    { service: 'Keycloak', status: 'UP', cpu: 20, memory: 35, disk: 12, responseTime: 45, lastCheck: new Date() },
    { service: 'Apache Airflow', status: 'DEGRADED', cpu: 78, memory: 82, disk: 60, responseTime: 350, lastCheck: new Date() },
    { service: 'Apache Atlas', status: 'UP', cpu: 22, memory: 45, disk: 28, responseTime: 85, lastCheck: new Date() },
    { service: 'Apache Ranger', status: 'UP', cpu: 18, memory: 30, disk: 15, responseTime: 50, lastCheck: new Date() },
  ];

  // ===================== NOTIFICATIONS =====================
  private notifications: Notification[] = [
    { id: 'N001', title: 'Critical Risk Alert', message: 'Cybersecurity Breach Risk has been escalated to CRITICAL', type: 'ERROR', read: false, createdAt: new Date(2026, 1, 15, 9, 30), link: '/risk-management', icon: 'pi pi-exclamation-triangle' },
    { id: 'N002', title: 'New Fraud Alert', message: '15 new fraud alerts generated in the last hour', type: 'WARNING', read: false, createdAt: new Date(2026, 1, 15, 9, 15), link: '/fraud-detection/alerts', icon: 'pi pi-shield' },
    { id: 'N003', title: 'Case Assigned', message: 'Case CASE-2024005 has been assigned to you', type: 'INFO', read: false, createdAt: new Date(2026, 1, 15, 8, 45), link: '/case-management', icon: 'pi pi-briefcase' },
    { id: 'N004', title: 'Model Performance Alert', message: 'Fraud Detection model accuracy dropped below 95%', type: 'WARNING', read: true, createdAt: new Date(2026, 1, 15, 8, 0), link: '/model-management', icon: 'pi pi-chart-line' },
    { id: 'N005', title: 'Compliance Deadline', message: 'GDPR annual review due in 7 days', type: 'INFO', read: true, createdAt: new Date(2026, 1, 14, 16, 0), link: '/compliance', icon: 'pi pi-calendar' },
    { id: 'N006', title: 'System Update', message: 'Scheduled maintenance on Feb 20, 2026 from 2:00 AM', type: 'INFO', read: true, createdAt: new Date(2026, 1, 14, 10, 0), link: '/admin', icon: 'pi pi-cog' },
    { id: 'N007', title: 'SAR Filed Successfully', message: 'SAR-2026-042 has been filed with the regulator', type: 'SUCCESS', read: true, createdAt: new Date(2026, 1, 13, 14, 30), link: '/aml-screening', icon: 'pi pi-check-circle' },
    { id: 'N008', title: 'AML Alert Escalated', message: 'AML-00012 escalated to senior review', type: 'WARNING', read: true, createdAt: new Date(2026, 1, 13, 11, 0), link: '/aml-screening', icon: 'pi pi-arrow-up' },
  ];

  // ===================== DASHBOARD STATS =====================
  getDashboardStats(): DashboardStats {
    return {
      totalRisks: this.risks.length,
      criticalRisks: this.risks.filter(r => r.riskLevel === RiskLevel.CRITICAL).length,
      highRisks: this.risks.filter(r => r.riskLevel === RiskLevel.HIGH).length,
      mediumRisks: this.risks.filter(r => r.riskLevel === RiskLevel.MEDIUM).length,
      lowRisks: this.risks.filter(r => r.riskLevel === RiskLevel.LOW).length,
      totalAlerts: this.fraudAlerts.length,
      openCases: this.cases.filter(c => c.status !== CaseStatus.CLOSED).length,
      transactionsToday: 24567,
      fraudPrevented: 1250000,
      falsePositiveRate: 12.5,
      complianceScore: 87,
      modelsInProduction: this.mlModels.filter(m => m.status === ModelStatus.PRODUCTION).length,
    };
  }

  getHeatMapData(): HeatMapData[] {
    const data: HeatMapData[] = [];
    for (let l = 1; l <= 5; l++) {
      for (let i = 1; i <= 5; i++) {
        const matching = this.risks.filter(r => r.likelihood === l && r.impact === i);
        data.push({ likelihood: l, impact: i, count: matching.length, risks: matching });
      }
    }
    return data;
  }

  getTimeSeriesData(days: number = 30): TimeSeriesData[] {
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(2026, 1, i + 1),
      value: Math.floor(Math.random() * 50) + 10,
      category: 'alerts',
    }));
  }

  getRiskByCategoryData(): { category: string; count: number }[] {
    const cats = Object.values(RiskCategory);
    return cats.map(c => ({ category: c, count: this.risks.filter(r => r.category === c).length }));
  }

  getRiskByDepartmentData(): { department: string; count: number }[] {
    const depts = [...new Set(this.risks.map(r => r.department))];
    return depts.map(d => ({ department: d, count: this.risks.filter(r => r.department === d).length }));
  }

  getAlertTrendData(): TimeSeriesData[] {
    return Array.from({ length: 30 }, (_, i) => ({
      date: new Date(2026, 0, 17 + i),
      value: Math.floor(Math.random() * 30) + 5,
    }));
  }

  getFraudByTypeData(): { type: string; count: number }[] {
    const types = ['Transaction Fraud', 'Card Fraud', 'Account Takeover', 'Identity Theft', 'Phishing', 'SIM Swap'];
    return types.map(t => ({ type: t, count: this.fraudAlerts.filter(a => a.alertType === t).length }));
  }

  getTransactionVolumeData(): TimeSeriesData[] {
    return Array.from({ length: 24 }, (_, i) => ({
      date: new Date(2026, 1, 15, i, 0),
      value: Math.floor(Math.random() * 1500) + 200,
    }));
  }

  // ===================== GETTERS =====================
  getUsers(): User[] { return [...this.users]; }
  getRisks(): Risk[] { return [...this.risks]; }
  getTransactions(): Transaction[] { return [...this.transactions]; }
  getFraudAlerts(): FraudAlert[] { return [...this.fraudAlerts]; }
  getCases(): Case[] { return [...this.cases]; }
  getAMLAlerts(): AMLAlert[] { return [...this.amlAlerts]; }
  getCustomerRisks(): CustomerRisk[] { return [...this.customerRisks]; }
  getMLModels(): MLModel[] { return [...this.mlModels]; }
  getDataAssets(): DataAsset[] { return [...this.dataAssets]; }
  getPolicies(): Policy[] { return [...this.policies]; }
  getAuditProjects(): AuditProject[] { return [...this.auditProjects]; }
  getSystemHealth(): SystemHealth[] { return [...this.systemHealthData]; }
  getNotifications(): Notification[] { return [...this.notifications]; }

  getAuditLogs(): any[] {
    return [
      { timestamp: new Date('2026-02-15T14:32:00'), username: 'admin', action: 'LOGIN', resource: 'System', details: 'Successful login', ipAddress: '192.168.1.100', status: 'SUCCESS' },
      { timestamp: new Date('2026-02-15T14:28:00'), username: 'fraudanalyst', action: 'UPDATE', resource: 'FraudAlert FA-2026-078', details: 'Status changed to IN_REVIEW', ipAddress: '192.168.1.105', status: 'SUCCESS' },
      { timestamp: new Date('2026-02-15T13:45:00'), username: 'riskmanager', action: 'CREATE', resource: 'Risk RSK-046', details: 'New risk registered', ipAddress: '192.168.1.102', status: 'SUCCESS' },
      { timestamp: new Date('2026-02-15T12:15:00'), username: 'compliance', action: 'UPDATE', resource: 'Policy POL-001', details: 'Policy version updated to v2.1', ipAddress: '192.168.1.108', status: 'SUCCESS' },
      { timestamp: new Date('2026-02-15T11:30:00'), username: 'amlofficer', action: 'CREATE', resource: 'SAR SAR-2026-042', details: 'SAR filed for customer Alpha Corp', ipAddress: '192.168.1.110', status: 'SUCCESS' },
      { timestamp: new Date('2026-02-15T10:22:00'), username: 'dataanalyst', action: 'UPDATE', resource: 'Model FraudDetector', details: 'Model retrained with new dataset', ipAddress: '192.168.1.115', status: 'SUCCESS' },
      { timestamp: new Date('2026-02-15T09:15:00'), username: 'admin', action: 'UPDATE', resource: 'User USR-003', details: 'Role changed to SENIOR_INVESTIGATOR', ipAddress: '192.168.1.100', status: 'SUCCESS' },
      { timestamp: new Date('2026-02-15T08:45:00'), username: 'unknown', action: 'LOGIN', resource: 'System', details: 'Failed login attempt', ipAddress: '10.0.0.55', status: 'FAILED' },
      { timestamp: new Date('2026-02-14T17:30:00'), username: 'executive', action: 'LOGIN', resource: 'System', details: 'Successful login', ipAddress: '192.168.1.120', status: 'SUCCESS' },
      { timestamp: new Date('2026-02-14T16:00:00'), username: 'auditor', action: 'CREATE', resource: 'AuditFinding', details: 'New finding documented for SOX audit', ipAddress: '192.168.1.118', status: 'SUCCESS' },
    ];
  }

  // ===================== AUTH =====================
  authenticate(username: string, password: string): User | null {
    const cred = this.credentials.find(c => c.username === username && c.password === password);
    if (cred) {
      return this.users.find(u => u.id === cred.userId) || null;
    }
    return null;
  }

  getCredentialsList(): { username: string; password: string; role: string; fullName: string }[] {
    return this.credentials.map(c => {
      const user = this.users.find(u => u.id === c.userId);
      return { username: c.username, password: c.password, role: user?.role || '', fullName: user?.fullName || '' };
    });
  }


  // ===== FRAUD RULES =====
  getFraudRules(): any[] {
    return [
      { id: 'FRL-001', name: 'High Value Transaction', description: 'Flag transactions above threshold', category: 'AMOUNT', priority: 'HIGH', threshold: '$10,000', action: 'ALERT', hitRate: 5.7, fpRate: 18, status: 'ACTIVE', createdAt: new Date('2025-01-15') },
      { id: 'FRL-002', name: 'Velocity Check', description: 'Multiple transactions in short window', category: 'VELOCITY', priority: 'HIGH', threshold: '>5 txn/10min', action: 'BLOCK', hitRate: 3.2, fpRate: 12, status: 'ACTIVE', createdAt: new Date('2025-02-01') },
      { id: 'FRL-003', name: 'Foreign Country', description: 'Transaction from high-risk country', category: 'GEOGRAPHIC', priority: 'MEDIUM', threshold: 'Risk list', action: 'ALERT', hitRate: 12.3, fpRate: 25, status: 'ACTIVE', createdAt: new Date('2025-01-20') },
      { id: 'FRL-004', name: 'New Device + High Amount', description: 'New device combined with high value', category: 'DEVICE', priority: 'HIGH', threshold: '>$5,000+new', action: 'CHALLENGE', hitRate: 8.5, fpRate: 15, status: 'ACTIVE', createdAt: new Date('2025-03-10') },
      { id: 'FRL-005', name: 'Card Not Present Pattern', description: 'Multiple CNP transactions', category: 'PATTERN', priority: 'MEDIUM', threshold: '>3 CNP/hour', action: 'ALERT', hitRate: 4.1, fpRate: 20, status: 'TESTING', createdAt: new Date('2025-06-15') },
      { id: 'FRL-006', name: 'Dormant Account Activity', description: 'Activity on dormant 6+ months', category: 'ACCOUNT', priority: 'LOW', threshold: '180 days', action: 'ALERT', hitRate: 2.1, fpRate: 10, status: 'ACTIVE', createdAt: new Date('2025-04-01') },
      { id: 'FRL-007', name: 'Round Amount Structuring', description: 'Round dollar patterns indicating structuring', category: 'AMOUNT', priority: 'MEDIUM', threshold: 'Pattern', action: 'ALERT', hitRate: 1.5, fpRate: 30, status: 'DRAFT', createdAt: new Date('2025-08-20') },
      { id: 'FRL-008', name: 'IP Reputation', description: 'Transaction from suspicious IP/proxy', category: 'DEVICE', priority: 'MEDIUM', threshold: 'Score<30', action: 'CHALLENGE', hitRate: 6.8, fpRate: 22, status: 'ACTIVE', createdAt: new Date('2025-05-10') },
    ];
  }

  // ===== BLACKLIST =====
  getBlacklist(): any[] {
    return [
      { id: 'BL-001', type: 'CARD', identifier: '4532****1234', reason: 'Confirmed fraud', addedBy: 'Trần Fraud Analyst', addedDate: new Date('2025-12-01'), expiryDate: null, status: 'ACTIVE' },
      { id: 'BL-002', type: 'DEVICE', identifier: 'fp_a8d3f9...', reason: 'Account takeover attempt', addedBy: 'System Auto', addedDate: new Date('2025-11-15'), expiryDate: new Date('2026-05-15'), status: 'ACTIVE' },
      { id: 'BL-003', type: 'IP', identifier: '185.234.xxx.xxx', reason: 'Botnet origin', addedBy: 'System Auto', addedDate: new Date('2026-01-20'), expiryDate: new Date('2026-07-20'), status: 'ACTIVE' },
      { id: 'BL-004', type: 'MERCHANT', identifier: 'MRC-FAKE-STORE', reason: 'Fake merchant', addedBy: 'Lê Minh AML', addedDate: new Date('2025-10-05'), expiryDate: null, status: 'ACTIVE' },
      { id: 'BL-005', type: 'ACCOUNT', identifier: 'ACC-9876543', reason: 'Money mule', addedBy: 'Hoàng Minh AML', addedDate: new Date('2026-01-10'), expiryDate: null, status: 'ACTIVE' },
      { id: 'BL-006', type: 'CARD', identifier: '5412****5678', reason: 'Lost/stolen card', addedBy: 'Customer Service', addedDate: new Date('2026-02-01'), expiryDate: null, status: 'ACTIVE' },
    ];
  }

  // ===== SAR RECORDS =====
  getSARRecords(): any[] {
    return [
      { id: 'SAR-2026-001', customerId: 'CUST-001', customerName: 'Nguyễn Văn An', type: 'Structuring', amount: 125000, status: 'FILED', filedDate: new Date('2026-01-15'), regulator: 'SBV', analyst: 'Hoàng Minh AML', caseId: 'CAS-AML-028' },
      { id: 'SAR-2026-002', customerId: 'CUST-005', customerName: 'Phạm Thị Hương', type: 'Rapid Movement', amount: 890000, status: 'DRAFT', filedDate: null, regulator: 'SBV', analyst: 'Lê Minh AML', caseId: null },
      { id: 'SAR-2026-003', customerId: 'CUST-008', customerName: 'Công ty Beta Corp', type: 'Unusual Pattern', amount: 2340000, status: 'UNDER_REVIEW', filedDate: null, regulator: 'SBV', analyst: 'Hoàng Minh AML', caseId: 'CAS-AML-030' },
      { id: 'SAR-2025-045', customerId: 'CUST-003', customerName: 'Trần Holdings', type: 'Sanctions Related', amount: 567000, status: 'FILED', filedDate: new Date('2025-12-20'), regulator: 'SBV', analyst: 'Hoàng Minh AML', caseId: 'CAS-AML-025' },
      { id: 'SAR-2025-044', customerId: 'CUST-012', customerName: 'Lê Văn Tuấn', type: 'Source of Funds', amount: 345000, status: 'FILED', filedDate: new Date('2025-11-30'), regulator: 'SBV', analyst: 'Lê Minh AML', caseId: 'CAS-AML-022' },
    ];
  }

  // ===== CONTROLS =====
  getControls(): any[] {
    return [
      { id: 'CTR-001', name: 'Transaction Monitoring', type: 'DETECTIVE', category: 'Fraud', description: 'Real-time monitoring of all transactions', frequency: 'CONTINUOUS', owner: 'IT Operations', effectiveness: 92, lastTestDate: new Date('2026-01-20'), lastTestResult: 'PASS', linkedRisks: ['RSK-001','RSK-003'], status: 'ACTIVE' },
      { id: 'CTR-002', name: 'KYC Verification', type: 'PREVENTIVE', category: 'AML', description: 'Customer identity verification at onboarding', frequency: 'PER_EVENT', owner: 'Compliance', effectiveness: 88, lastTestDate: new Date('2026-01-15'), lastTestResult: 'PASS', linkedRisks: ['RSK-002','RSK-005'], status: 'ACTIVE' },
      { id: 'CTR-003', name: 'Access Review', type: 'DETECTIVE', category: 'IT Security', description: 'Quarterly review of user access rights', frequency: 'QUARTERLY', owner: 'IT Security', effectiveness: 75, lastTestDate: new Date('2025-12-31'), lastTestResult: 'PARTIAL', linkedRisks: ['RSK-004'], status: 'ACTIVE' },
      { id: 'CTR-004', name: 'Dual Authorization', type: 'PREVENTIVE', category: 'Operations', description: 'Two-person approval for high-value transactions', frequency: 'PER_EVENT', owner: 'Operations', effectiveness: 95, lastTestDate: new Date('2026-02-01'), lastTestResult: 'PASS', linkedRisks: ['RSK-001','RSK-006'], status: 'ACTIVE' },
      { id: 'CTR-005', name: 'Data Encryption', type: 'PREVENTIVE', category: 'IT Security', description: 'AES-256 encryption at rest and in transit', frequency: 'CONTINUOUS', owner: 'IT Security', effectiveness: 98, lastTestDate: new Date('2026-01-10'), lastTestResult: 'PASS', linkedRisks: ['RSK-004','RSK-007'], status: 'ACTIVE' },
      { id: 'CTR-006', name: 'Sanctions Screening', type: 'PREVENTIVE', category: 'AML', description: 'Real-time screening against OFAC/EU/UN lists', frequency: 'CONTINUOUS', owner: 'AML Team', effectiveness: 90, lastTestDate: new Date('2026-02-05'), lastTestResult: 'PASS', linkedRisks: ['RSK-002','RSK-008'], status: 'ACTIVE' },
      { id: 'CTR-007', name: 'Incident Response', type: 'CORRECTIVE', category: 'Operations', description: 'Documented incident response procedures', frequency: 'PER_EVENT', owner: 'IT Operations', effectiveness: 82, lastTestDate: new Date('2025-11-20'), lastTestResult: 'PASS', linkedRisks: ['RSK-003','RSK-009'], status: 'ACTIVE' },
      { id: 'CTR-008', name: 'Segregation of Duties', type: 'PREVENTIVE', category: 'Internal Control', description: 'Separation of incompatible functions', frequency: 'CONTINUOUS', owner: 'Internal Audit', effectiveness: 85, lastTestDate: new Date('2025-12-15'), lastTestResult: 'PARTIAL', linkedRisks: ['RSK-001','RSK-006'], status: 'ACTIVE' },
    ];
  }

  // ===== AUDIT FINDINGS =====
  getAuditFindings(): any[] {
    return [
      { id: 'FND-001', auditId: 'AUD-001', title: 'Insufficient transaction monitoring thresholds', severity: 'HIGH', description: 'Current thresholds too high, missing small-value structuring', rootCause: 'Thresholds not updated since 2024', recommendation: 'Review and lower thresholds', managementResponse: 'Agreed, will update by Q1', dueDate: new Date('2026-03-31'), status: 'OPEN', owner: 'IT Operations' },
      { id: 'FND-002', auditId: 'AUD-001', title: 'Missing access review documentation', severity: 'MEDIUM', description: 'Q4 2025 access review not fully documented', rootCause: 'Process not followed', recommendation: 'Enforce documentation requirements', managementResponse: 'Will implement checklist', dueDate: new Date('2026-02-28'), status: 'IN_PROGRESS', owner: 'IT Security' },
      { id: 'FND-003', auditId: 'AUD-002', title: 'PCI DSS key rotation overdue', severity: 'HIGH', description: 'Encryption key rotation 3 months overdue', rootCause: 'Manual process, scheduling error', recommendation: 'Automate key rotation', managementResponse: 'Automation scheduled', dueDate: new Date('2026-02-15'), status: 'OVERDUE', owner: 'IT Security' },
      { id: 'FND-004', auditId: 'AUD-002', title: 'Incomplete cardholder data flow diagram', severity: 'LOW', description: 'Flow diagram missing 2 new endpoints', rootCause: 'Recent changes not reflected', recommendation: 'Update diagram', managementResponse: 'Will update', dueDate: new Date('2026-03-15'), status: 'OPEN', owner: 'Architecture' },
      { id: 'FND-005', auditId: 'AUD-003', title: 'AML training completion below target', severity: 'MEDIUM', description: 'Only 78% staff completed AML training vs 95% target', rootCause: 'New hires not enrolled', recommendation: 'Auto-enroll new hires', managementResponse: 'Automated enrollment added', dueDate: new Date('2026-01-31'), status: 'RESOLVED', owner: 'HR/Compliance' },
    ];
  }

  // ===== TRAINING COURSES =====
  getTrainingCourses(): any[] {
    return [
      { id: 'TRN-001', title: 'AML/KYC Fundamentals', description: 'Core AML and Know Your Customer principles', duration: '4 hours', target: 'All Staff', requirement: 'MANDATORY', dueDate: new Date('2026-03-31'), enrolled: 200, completed: 184, inProgress: 10, notStarted: 6, passRate: 95 },
      { id: 'TRN-002', title: 'GDPR Data Privacy', description: 'EU General Data Protection Regulation', duration: '3 hours', target: 'All Staff', requirement: 'MANDATORY', dueDate: new Date('2026-02-28'), enrolled: 200, completed: 156, inProgress: 24, notStarted: 20, passRate: 92 },
      { id: 'TRN-003', title: 'Fraud Awareness', description: 'Identifying and preventing fraud', duration: '2 hours', target: 'Operations, Customer Service', requirement: 'MANDATORY', dueDate: new Date('2026-04-15'), enrolled: 120, completed: 102, inProgress: 12, notStarted: 6, passRate: 88 },
      { id: 'TRN-004', title: 'Cybersecurity Essentials', description: 'Phishing, social engineering, data handling', duration: '2 hours', target: 'All Staff', requirement: 'MANDATORY', dueDate: new Date('2026-05-31'), enrolled: 200, completed: 90, inProgress: 45, notStarted: 65, passRate: 91 },
      { id: 'TRN-005', title: 'PCI DSS Awareness', description: 'Payment card security standards', duration: '1.5 hours', target: 'IT, Operations', requirement: 'ROLE_BASED', dueDate: new Date('2026-03-15'), enrolled: 80, completed: 72, inProgress: 5, notStarted: 3, passRate: 97 },
      { id: 'TRN-006', title: 'Advanced Fraud Investigation', description: 'Investigation techniques and evidence handling', duration: '8 hours', target: 'Fraud Analysts', requirement: 'ROLE_BASED', dueDate: new Date('2026-06-30'), enrolled: 15, completed: 8, inProgress: 4, notStarted: 3, passRate: 100 },
    ];
  }

  // ===== VIOLATIONS =====
  getViolations(): any[] {
    return [
      { id: 'VIO-001', type: 'POLICY', severity: 'HIGH', user: 'Nguyễn Tester', department: 'IT', description: 'Shared admin credentials with unauthorized person', evidence: 'Access log correlation', date: new Date('2026-02-10'), status: 'UNDER_INVESTIGATION', action: 'Suspended access pending review' },
      { id: 'VIO-002', type: 'DATA', severity: 'MEDIUM', user: 'Phạm Minh', department: 'Operations', description: 'Exported customer PII without authorization', evidence: 'DLP alert, audit log', date: new Date('2026-01-28'), status: 'RESOLVED', action: 'Written warning, training required' },
      { id: 'VIO-003', type: 'PROCEDURE', severity: 'LOW', user: 'Lê Analyst', department: 'Risk', description: 'Failed to document risk assessment rationale', evidence: 'Missing documentation', date: new Date('2026-02-05'), status: 'OPEN', action: 'Pending review' },
      { id: 'VIO-004', type: 'REGULATORY', severity: 'HIGH', user: 'Auto-Detect', department: 'System', description: 'SAR filing deadline missed by 2 days', evidence: 'Filing tracker', date: new Date('2025-12-17'), status: 'RESOLVED', action: 'Process improvement, late filing submitted' },
    ];
  }

  // ===== REFERENCE DATA =====
  getReferenceData(): any[] {
    return [
      { id: 'REF-001', tableName: 'Risk Categories', entries: 5, values: 'Strategic, Financial, Operational, Compliance, Reputational', lastUpdated: new Date('2025-06-01'), updatedBy: 'Admin' },
      { id: 'REF-002', tableName: 'Risk Levels', entries: 4, values: 'Critical, High, Medium, Low', lastUpdated: new Date('2025-06-01'), updatedBy: 'Admin' },
      { id: 'REF-003', tableName: 'Fraud Types', entries: 6, values: 'Card Fraud, Identity Theft, Account Takeover, Wire Fraud, Check Fraud, Insider', lastUpdated: new Date('2025-08-15'), updatedBy: 'Admin' },
      { id: 'REF-004', tableName: 'Alert Priorities', entries: 3, values: 'HIGH, MEDIUM, LOW', lastUpdated: new Date('2025-06-01'), updatedBy: 'Admin' },
      { id: 'REF-005', tableName: 'Case Statuses', entries: 5, values: 'OPEN, IN_PROGRESS, ESCALATED, RESOLVED, CLOSED', lastUpdated: new Date('2025-09-10'), updatedBy: 'Admin' },
      { id: 'REF-006', tableName: 'Countries', entries: 195, values: 'ISO 3166-1 country codes', lastUpdated: new Date('2026-01-01'), updatedBy: 'System' },
      { id: 'REF-007', tableName: 'Currencies', entries: 42, values: 'VND, USD, EUR, GBP, JPY, ...', lastUpdated: new Date('2026-01-01'), updatedBy: 'System' },
      { id: 'REF-008', tableName: 'Transaction Types', entries: 8, values: 'PURCHASE, TRANSFER, WITHDRAWAL, DEPOSIT, PAYMENT, REFUND, FEE, INTEREST', lastUpdated: new Date('2025-07-20'), updatedBy: 'Admin' },
      { id: 'REF-009', tableName: 'Department Codes', entries: 10, values: 'RISK, FRAUD, AML, COMPLIANCE, IT, OPS, FINANCE, HR, LEGAL, EXEC', lastUpdated: new Date('2025-06-01'), updatedBy: 'Admin' },
    ];
  }

  // ===== NOTIFICATION RULES =====
  getNotificationRules(): any[] {
    return [
      { id: 'NR-001', event: 'Alert Created (HIGH)', condition: 'priority = HIGH', recipients: 'FRAUD_ANALYST, RISK_MANAGER', channels: 'Email, In-App, SMS', template: 'high_alert', status: 'ACTIVE' },
      { id: 'NR-002', event: 'Case Assigned', condition: 'assignee changed', recipients: 'Assigned User', channels: 'Email, In-App', template: 'case_assigned', status: 'ACTIVE' },
      { id: 'NR-003', event: 'SLA Breach Warning', condition: 'SLA < 2 hours remaining', recipients: 'Assigned User, Manager', channels: 'Email, In-App, SMS', template: 'sla_warning', status: 'ACTIVE' },
      { id: 'NR-004', event: 'Risk Approved', condition: 'risk status = APPROVED', recipients: 'Risk Owner', channels: 'Email, In-App', template: 'risk_approved', status: 'ACTIVE' },
      { id: 'NR-005', event: 'Model Drift Detected', condition: 'PSI > 0.2', recipients: 'DATA_ANALYST, SYSTEM_ADMIN', channels: 'Email, In-App, SMS', template: 'model_drift', status: 'ACTIVE' },
      { id: 'NR-006', event: 'Daily Digest', condition: 'Daily at 08:00', recipients: 'EXECUTIVE', channels: 'Email', template: 'daily_digest', status: 'ACTIVE' },
    ];
  }

  // ===== WORKFLOW TEMPLATES =====
  getWorkflowTemplates(): any[] {
    return [
      { id: 'WF-001', name: 'Risk Assessment Approval', description: 'Submit → Review → Approve/Reject', steps: 4, instances: 156, activeInstances: 12, status: 'PUBLISHED' },
      { id: 'WF-002', name: 'Case Investigation', description: 'Create → Assign → Investigate → Close', steps: 6, instances: 342, activeInstances: 28, status: 'PUBLISHED' },
      { id: 'WF-003', name: 'SAR Filing', description: 'Draft → Review → Approve → File → Confirm', steps: 5, instances: 45, activeInstances: 3, status: 'PUBLISHED' },
      { id: 'WF-004', name: 'Model Deployment', description: 'Test → Stage → Approve → Deploy → Monitor', steps: 5, instances: 18, activeInstances: 1, status: 'PUBLISHED' },
      { id: 'WF-005', name: 'Access Request', description: 'Request → Manager → Data Owner → Provision', steps: 4, instances: 89, activeInstances: 5, status: 'PUBLISHED' },
      { id: 'WF-006', name: 'Policy Update', description: 'Draft → Review → Legal → Approve → Publish', steps: 5, instances: 23, activeInstances: 2, status: 'DRAFT' },
    ];
  }

  // ===== REPORT SCHEDULES =====
  getScheduledReports(): any[] {
    return [
      { id: 'RPT-001', name: 'Daily Transaction Summary', category: 'Transaction', format: 'PDF', frequency: 'DAILY', time: '08:00', recipients: 'risk-team@iris.com', lastRun: new Date('2026-02-16'), nextRun: new Date('2026-02-17'), status: 'ACTIVE' },
      { id: 'RPT-002', name: 'Weekly Fraud Report', category: 'Fraud', format: 'Excel', frequency: 'WEEKLY', time: 'Monday 09:00', recipients: 'fraud-team@iris.com, executive@iris.com', lastRun: new Date('2026-02-10'), nextRun: new Date('2026-02-17'), status: 'ACTIVE' },
      { id: 'RPT-003', name: 'Monthly Risk Report', category: 'Risk', format: 'PDF', frequency: 'MONTHLY', time: '1st, 08:00', recipients: 'cro@iris.com, board@iris.com', lastRun: new Date('2026-02-01'), nextRun: new Date('2026-03-01'), status: 'ACTIVE' },
      { id: 'RPT-004', name: 'Quarterly Compliance', category: 'Compliance', format: 'PDF', frequency: 'QUARTERLY', time: '1st of quarter', recipients: 'compliance@iris.com, regulator@sbv.gov.vn', lastRun: new Date('2026-01-05'), nextRun: new Date('2026-04-01'), status: 'ACTIVE' },
      { id: 'RPT-005', name: 'AML Screening Report', category: 'AML', format: 'PDF', frequency: 'WEEKLY', time: 'Friday 17:00', recipients: 'aml-team@iris.com', lastRun: new Date('2026-02-14'), nextRun: new Date('2026-02-21'), status: 'ACTIVE' },
      { id: 'RPT-006', name: 'Model Performance', category: 'ML', format: 'Excel', frequency: 'MONTHLY', time: '15th, 10:00', recipients: 'data-team@iris.com', lastRun: new Date('2026-02-15'), nextRun: new Date('2026-03-15'), status: 'ACTIVE' },
    ];
  }

}
