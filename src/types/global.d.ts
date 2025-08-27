import { ContentText } from 'pdfmake/interfaces';
import { PermissionStatus } from './enums';

export type OwaspSeverity = 'E' | 'W';
export interface Permission {
  severity: OwaspSeverity;
  message: ContentText[] | string;
  owaspCategory: OwaspCategory;
}

export interface UserPermission extends Permission {
  requiredDependencies: string[];
}
export interface Report {
  file: string;
  line: string;
  pattern: string;
}

export interface GeneralPermission extends Permission {
  values: string[];
}

export interface PermissionData extends Permission {
  numLine: null | number;
  status: PermissionStatus;
  permission: string;
  extraData?: Report[];
  libraryReports?: DependencyReport[];
  nameFile?: string;
}

export interface PdfDataPer {
  title: string;
  percentageJustified: number;
  percentageJustifiedLabel: string;
  permissions: PermissionData[];
}

export interface TransformPdfData {
  owasp: PdfDataPermission;
  percentage: number;
  percentageLabel: string;
  status: string;
}

export interface PdfData extends TransformPdfData {
  date: string;
  appName: string;
  currentBranch: string;
}

export type PdfDataPermission = Record<string, PdfDataPer>;

type OwaspCategory =
  | 'M1'
  | 'M2'
  | 'M3'
  | 'M4'
  | 'M5'
  | 'M6'
  | 'M7'
  | 'M8'
  | 'M9'
  | 'M10';

export interface Owasp {
  title: string;
}

interface DependencyReport {
  library: string;
  version: string;
  description: string;
  vulnId: string;
  severity: string;
  owaspCategory: OwaspCategory;
  url: string;
}

export interface LibraryVulnerability {
  package: string;
  minVersion: number | string;
  maxVersion: string;
  vulnId: string;
  description: string;
  url: string;
  severity: string;
  owaspCategory: OwaspCategory;
}
