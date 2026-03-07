import { PermissionStatus } from './enums';
import { PermissionData } from './global';

export type PlatformScope = 'android' | 'ios' | 'all';
export type ReportFormat = 'pdf' | 'json' | 'both';

export interface AuditOptions {
  projectPath: string;
  platform: PlatformScope;
  safe: boolean;
  fixRisky: boolean;
  reportFormat: ReportFormat;
  includeDevDependencies: boolean;
}

export interface AuditCliOptions {
  platform?: PlatformScope;
  safe?: boolean;
  fixRisky?: boolean;
  reportFormat?: ReportFormat;
  includeDevDependencies?: boolean;
}

export interface OwaspBpConfig {
  hostname: string;
  platforms?: PlatformScope;
  safeMode?: boolean;
  allowRiskyFixes?: boolean;
  reportFormat?: ReportFormat;
  includeDevDependencies?: boolean;
  iosInfoPlistPath?: string;
}

export interface Finding {
  id: string;
  ruleId: string;
  platform: 'android' | 'ios';
  variant: string;
  file: string;
  line: number | null;
  severity: string;
  owaspCategory: string;
  status: PermissionStatus;
  message: string;
  fixAvailable: boolean;
  fixRisk: 'low' | 'medium' | 'high' | 'none';
}

export interface VerifyOutput {
  findings: Finding[];
  permissionData: PermissionData[];
}

export type AutomationStatus =
  | 'FIXED'
  | 'ALREADY_COMPLIANT'
  | 'SKIPPED'
  | 'FAILED';

export type AutomationSkipReasonCode =
  | 'SAFE_MODE_BLOCKED'
  | 'MISSING_CONFIG'
  | 'FILE_NOT_FOUND'
  | 'PATTERN_NOT_FOUND'
  | 'MANUAL_REVIEW_REQUIRED'
  | 'NOT_SUPPORTED';

export type AutomationRisk = 'low' | 'medium' | 'high';

export interface AutomationBeforeAfter {
  file: string;
  before: string;
  after: string;
}

export interface AutomationRuleResult {
  ruleId: string;
  platform: 'android' | 'ios';
  status: AutomationStatus;
  risk: AutomationRisk;
  filesChanged: string[];
  beforeAfter: AutomationBeforeAfter[];
  reasonCode?: AutomationSkipReasonCode;
  reasonMessage?: string;
  manualAction?: string;
  durationMs: number;
}

export interface AutomationReportSummary {
  totalRules: number;
  fixed: number;
  alreadyCompliant: number;
  skipped: number;
  failed: number;
  fixSuccessRate: number;
  residualHigh: number;
  residualMedium: number;
  residualLow: number;
}

export interface AutomationRunReport {
  appName: string;
  currentBranch: string;
  generatedAt: string;
  command: string;
  options: {
    platform: PlatformScope;
    reportFormat: ReportFormat;
    safe: boolean;
    fixRisky: boolean;
    includeDevDependencies: boolean;
  };
  summary: AutomationReportSummary;
  results: AutomationRuleResult[];
}
