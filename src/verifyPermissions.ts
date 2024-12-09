import { PermissionStatus } from './types/enums';
import { GeneralPermission, PermissionData } from './types/global';
import { linesUpToMatch, validateSeverity } from './utils/tool';

interface VerifyPermissions {
  strData: string;
  regexFn: (mainKey: string) => RegExp;
  groupRegexPos?: number;
  permissions: Record<string, GeneralPermission>;
  nameFile: string;
}

const verifyPermissions = ({
  strData,
  regexFn,
  permissions,
  groupRegexPos = 1,
  nameFile,
}: VerifyPermissions): PermissionData[] => {
  const owaspValidate: PermissionData[] = [];
  for (const [mainKey, data] of Object.entries(permissions)) {
    const regex = regexFn(mainKey);

    const matchData = regex.exec(strData);

    const permission: PermissionData = {
      permission: mainKey,
      owaspCategory: data.owaspCategory,
      severity: data.severity,
      message: data.message,
      numLine: null,
      status: PermissionStatus.NOT_FOUND,
      nameFile,
    };
    if (!matchData) {
      permission.status = PermissionStatus.NOT_FOUND;
    } else {
      const numLine = linesUpToMatch(strData, matchData.index);
      permission.numLine = numLine;
      permission.status = validateSeverity(
        data.severity,
        data.values.includes(matchData[groupRegexPos])
      );
    }
    owaspValidate.push(permission);
  }
  return owaspValidate;
};
export default verifyPermissions;
