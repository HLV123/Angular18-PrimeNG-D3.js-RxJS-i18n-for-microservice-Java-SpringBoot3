// ===================== ENUMS =====================
export enum RiskLevel { CRITICAL = 'CRITICAL', HIGH = 'HIGH', MEDIUM = 'MEDIUM', LOW = 'LOW' }
export enum RiskCategory { STRATEGIC = 'STRATEGIC', FINANCIAL = 'FINANCIAL', OPERATIONAL = 'OPERATIONAL', COMPLIANCE = 'COMPLIANCE', REPUTATIONAL = 'REPUTATIONAL' }
export enum RiskStatus { DRAFT = 'DRAFT', ACTIVE = 'ACTIVE', CLOSED = 'CLOSED', RETIRED = 'RETIRED' }
export enum TreatmentStrategy { AVOID = 'AVOID', REDUCE = 'REDUCE', TRANSFER = 'TRANSFER', ACCEPT = 'ACCEPT' }
export enum ControlType { PREVENTIVE = 'PREVENTIVE', DETECTIVE = 'DETECTIVE', CORRECTIVE = 'CORRECTIVE' }
export enum AlertPriority { HIGH = 'HIGH', MEDIUM = 'MEDIUM', LOW = 'LOW' }
export enum AlertStatus { NEW = 'NEW', ASSIGNED = 'ASSIGNED', IN_REVIEW = 'IN_REVIEW', RESOLVED = 'RESOLVED', CLOSED = 'CLOSED' }
export enum AlertType { FRAUD = 'FRAUD', AML = 'AML', RISK = 'RISK', COMPLIANCE = 'COMPLIANCE' }
export enum CaseStatus { OPEN = 'OPEN', UNDER_INVESTIGATION = 'UNDER_INVESTIGATION', PENDING_REVIEW = 'PENDING_REVIEW', RESOLVED = 'RESOLVED', CLOSED = 'CLOSED' }
export enum CaseType { CARD_FRAUD = 'CARD_FRAUD', ACCOUNT_TAKEOVER = 'ACCOUNT_TAKEOVER', IDENTITY_THEFT = 'IDENTITY_THEFT', MONEY_LAUNDERING = 'MONEY_LAUNDERING', INSIDER_FRAUD = 'INSIDER_FRAUD' }
export enum TransactionStatus { APPROVED = 'APPROVED', BLOCKED = 'BLOCKED', UNDER_REVIEW = 'UNDER_REVIEW', PENDING = 'PENDING' }
export enum TransactionType { PURCHASE = 'PURCHASE', TRANSFER = 'TRANSFER', WITHDRAWAL = 'WITHDRAWAL', DEPOSIT = 'DEPOSIT', PAYMENT = 'PAYMENT' }
export enum TransactionChannel { ATM = 'ATM', POS = 'POS', ONLINE = 'ONLINE', MOBILE = 'MOBILE', BRANCH = 'BRANCH' }
export enum ModelStatus { DEVELOPMENT = 'DEVELOPMENT', TESTING = 'TESTING', STAGING = 'STAGING', PRODUCTION = 'PRODUCTION', RETIRED = 'RETIRED' }
export enum UserRole { SYSTEM_ADMIN = 'SYSTEM_ADMIN', RISK_MANAGER = 'RISK_MANAGER', RISK_ANALYST = 'RISK_ANALYST', FRAUD_ANALYST = 'FRAUD_ANALYST', SENIOR_INVESTIGATOR = 'SENIOR_INVESTIGATOR', AML_OFFICER = 'AML_OFFICER', COMPLIANCE_OFFICER = 'COMPLIANCE_OFFICER', DATA_ANALYST = 'DATA_ANALYST', AUDITOR = 'AUDITOR', EXECUTIVE = 'EXECUTIVE', BUSINESS_USER = 'BUSINESS_USER' }
export enum KYCStatus { VERIFIED = 'VERIFIED', PENDING = 'PENDING', FAILED = 'FAILED', EXPIRED = 'EXPIRED' }
export enum SanctionMatchStatus { NO_MATCH = 'NO_MATCH', POSSIBLE_MATCH = 'POSSIBLE_MATCH', CONFIRMED_MATCH = 'CONFIRMED_MATCH' }
export enum ComplianceFramework { GDPR = 'GDPR', PCI_DSS = 'PCI_DSS', SOX = 'SOX', ISO_27001 = 'ISO_27001', BASEL_III = 'BASEL_III' }

// ===================== CORE MODELS =====================
export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  department: string;
  role: UserRole;
  roles: UserRole[];
  avatar?: string;
  phone?: string;
  title?: string;
  manager?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
  lastLogin?: Date;
  createdAt: Date;
  permissions: string[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  read: boolean;
  createdAt: Date;
  link?: string;
  icon?: string;
}

// ===================== RISK MANAGEMENT =====================
export interface Risk {
  id: string;
  title: string;
  description: string;
  category: RiskCategory;
  department: string;
  owner: string;
  ownerName: string;
  status: RiskStatus;
  likelihood: number;
  impact: number;
  inherentScore: number;
  residualScore: number;
  riskLevel: RiskLevel;
  velocity?: string;
  appetite?: number;
  controlEffectiveness: number;
  treatmentStrategy: TreatmentStrategy;
  actionPlans: ActionPlan[];
  controls: Control[];
  kris: KRI[];
  createdAt: Date;
  updatedAt: Date;
  lastAssessmentDate?: Date;
}

export interface ActionPlan {
  id: string;
  description: string;
  responsible: string;
  dueDate: Date;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  completion: number;
}

export interface Control {
  id: string;
  description: string;
  type: ControlType;
  effectiveness: number;
  testFrequency: string;
  lastTestDate?: Date;
  lastTestResult?: 'PASS' | 'FAIL' | 'PARTIAL';
}

export interface KRI {
  id: string;
  name: string;
  description: string;
  currentValue: number;
  warningThreshold: number;
  criticalThreshold: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  unit: string;
  history: { date: Date; value: number }[];
}

export interface RiskAssessment {
  id: string;
  name: string;
  scope: string;
  framework: string;
  periodFrom: Date;
  periodTo: Date;
  status: 'DRAFT' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  teamMembers: string[];
  risks: Risk[];
}

// ===================== FRAUD DETECTION =====================
export interface Transaction {
  id: string;
  timestamp: Date;
  customerId: string;
  customerName: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  merchant?: string;
  beneficiary?: string;
  channel: TransactionChannel;
  location?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  fraudScore: number;
  riskLevel: RiskLevel;
  status: TransactionStatus;
  deviceFingerprint?: string;
  ipAddress?: string;
  cardNumber?: string;
}

export interface FraudAlert {
  id: string;
  createdAt: Date;
  customerId: string;
  customerName: string;
  transactionId: string;
  alertType: string;
  fraudScore: number;
  priority: AlertPriority;
  status: AlertStatus;
  assignedTo?: string;
  assignedToName?: string;
  age: number;
  slaDeadline?: Date;
  ruleTriggered: string;
  description: string;
  amount: number;
  channel: TransactionChannel;
}

export interface FraudRule {
  id: string;
  name: string;
  description: string;
  category: string;
  priority: AlertPriority;
  conditions: RuleCondition[];
  actions: string[];
  hitRate: number;
  falsePositiveRate: number;
  status: 'ACTIVE' | 'INACTIVE' | 'TESTING';
  createdAt: Date;
  updatedAt: Date;
}

export interface RuleCondition {
  field: string;
  operator: string;
  value: string | number;
  logic?: 'AND' | 'OR';
}

// ===================== AML =====================
export interface AMLAlert {
  id: string;
  customerId: string;
  customerName: string;
  riskScore: number;
  scenario: string;
  status: AlertStatus;
  priority: AlertPriority;
  createdAt: Date;
  assignedTo?: string;
  transactionCount: number;
  totalAmount: number;
}

export interface CustomerRisk {
  id: string;
  name: string;
  type: 'INDIVIDUAL' | 'BUSINESS';
  riskScore: number;
  riskCategory: RiskLevel;
  isPEP: boolean;
  kycStatus: KYCStatus;
  countryRisk: RiskLevel;
  lastReviewDate: Date;
  nextReviewDue: Date;
  accountCount: number;
  sanctions: SanctionMatch[];
}

export interface SanctionMatch {
  id: string;
  listSource: string;
  matchScore: number;
  matchedName: string;
  status: SanctionMatchStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
}

export interface SAR {
  id: string;
  customerId: string;
  customerName: string;
  status: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'FILED';
  filedDate?: Date;
  description: string;
  amount: number;
  createdBy: string;
  createdAt: Date;
}

// ===================== CASE MANAGEMENT =====================
export interface Case {
  id: string;
  title: string;
  type: CaseType;
  status: CaseStatus;
  priority: AlertPriority;
  customerId: string;
  customerName: string;
  assignedTo: string;
  assignedToName: string;
  fraudAmount: number;
  recoveryAmount: number;
  description: string;
  openDate: Date;
  closedDate?: Date;
  slaDeadline: Date;
  alertCount: number;
  transactionCount: number;
  documentCount: number;
}

export interface CaseNote {
  id: string;
  caseId: string;
  author: string;
  authorName: string;
  content: string;
  createdAt: Date;
  type: 'NOTE' | 'SYSTEM' | 'COMMUNICATION';
}

// ===================== ALERT MANAGEMENT =====================
export interface Alert {
  id: string;
  type: AlertType;
  source: 'RULE' | 'MODEL' | 'MANUAL';
  subject: string;
  subjectType: 'CUSTOMER' | 'TRANSACTION' | 'ENTITY';
  priority: AlertPriority;
  score: number;
  status: AlertStatus;
  assignedTo?: string;
  assignedToName?: string;
  age: number;
  slaCountdown?: number;
  createdAt: Date;
  description: string;
}

// ===================== MODEL MANAGEMENT =====================
export interface MLModel {
  id: string;
  name: string;
  type: 'CLASSIFICATION' | 'REGRESSION' | 'CLUSTERING' | 'ANOMALY_DETECTION';
  useCase: string;
  algorithm: string;
  version: string;
  status: ModelStatus;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc: number;
  owner: string;
  createdAt: Date;
  updatedAt: Date;
  predictionCount: number;
  avgLatency: number;
}

// ===================== DATA GOVERNANCE =====================
export interface DataAsset {
  id: string;
  name: string;
  type: 'DATABASE' | 'TABLE' | 'FILE' | 'API' | 'STREAM';
  source: string;
  owner: string;
  classification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED' | 'PII';
  qualityScore: number;
  tags: string[];
  description: string;
  schema?: any;
  lastUpdated: Date;
}

export interface DataQualityRule {
  id: string;
  name: string;
  dataAsset: string;
  dimension: 'COMPLETENESS' | 'ACCURACY' | 'CONSISTENCY' | 'TIMELINESS' | 'UNIQUENESS' | 'VALIDITY';
  rule: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  score: number;
  lastRun: Date;
}

// ===================== COMPLIANCE =====================
export interface Policy {
  id: string;
  name: string;
  category: string;
  description: string;
  version: string;
  effectiveDate: Date;
  reviewDate: Date;
  owner: string;
  status: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED' | 'RETIRED';
  framework: ComplianceFramework;
}

export interface AuditFinding {
  id: string;
  auditId: string;
  severity: RiskLevel;
  description: string;
  rootCause: string;
  recommendation: string;
  managementResponse: string;
  dueDate: Date;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'OVERDUE';
  assignedTo: string;
}

export interface AuditProject {
  id: string;
  name: string;
  type: 'INTERNAL' | 'EXTERNAL' | 'REGULATORY';
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  auditor: string;
  startDate: Date;
  endDate: Date;
  scope: string;
  findingCount: number;
}

// ===================== SYSTEM ADMIN =====================
export interface AuditLog {
  id: string;
  timestamp: Date;
  user: string;
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
  entityType: string;
  entityId: string;
  oldValue?: string;
  newValue?: string;
  ipAddress: string;
  result: 'SUCCESS' | 'FAILURE';
}

export interface SystemHealth {
  service: string;
  status: 'UP' | 'DOWN' | 'DEGRADED';
  cpu: number;
  memory: number;
  disk: number;
  responseTime: number;
  lastCheck: Date;
}

// ===================== CHART DATA =====================
export interface HeatMapData {
  likelihood: number;
  impact: number;
  count: number;
  risks: Risk[];
}

export interface TimeSeriesData {
  date: Date;
  value: number;
  category?: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  size: number;
  color: string;
  x?: number;
  y?: number;
}

export interface GraphLink {
  source: string;
  target: string;
  weight: number;
  label?: string;
}

export interface DashboardStats {
  totalRisks: number;
  criticalRisks: number;
  highRisks: number;
  mediumRisks: number;
  lowRisks: number;
  totalAlerts: number;
  openCases: number;
  transactionsToday: number;
  fraudPrevented: number;
  falsePositiveRate: number;
  complianceScore: number;
  modelsInProduction: number;
}
