export interface Permission {
  requiredDependencies: string[];
  severity: string;
  message: string;
  owaspCategory: OwaspCategory;
}

export interface VerifyUserPermission {
  permission: string;
  numLine: number;
  owaspCategory: OwaspCategory;
  severity: string;
  justifyPermission: boolean;
}

export interface PdfDataPer {
  percentageJustified: number;
  percentageJustifiedLabel: string;
  permissions: VerifyUserPermission[];
}

export type PdfDataPermission = Record<string, PdfDataPer>;

type OwaspCategory =
  | "M1"
  | "M2"
  | "M3"
  | "M4"
  | "M5"
  | "M6"
  | "M7"
  | "M8"
  | "M9"
  | "M10";
