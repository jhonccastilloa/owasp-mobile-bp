import { PermissionStatus } from "./enums";

export interface Permission {
  severity: string;
  message: string;
  owaspCategory: OwaspCategory;
}

export interface UserPermission extends Permission {
  requiredDependencies: string[];
}
export interface Report {
  file: string;
  line: number;
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
  nameFile?: string;

}

export interface PdfDataPer {
  percentageJustified: number;
  percentageJustifiedLabel: string;
  permissions: PermissionData[];
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
