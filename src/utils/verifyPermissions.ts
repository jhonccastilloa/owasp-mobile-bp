import { PermissionStatus } from '@/types/enums';
import { GeneralPermission, PermissionData } from '@/types/global';
import { linesUpToMatch, validateSeverity } from './tool';

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
    let matchData: RegExpExecArray | null;
    const permission: PermissionData = {
      permission: mainKey,
      owaspCategory: data.owaspCategory,
      severity: data.severity,
      message: data.message,
      numLine: null,
      status: PermissionStatus.NOT_FOUND,
      nameFile,
    };
    const permissions: PermissionData[] = [];
    while ((matchData = regex.exec(strData)) !== null) {
      const numLine = linesUpToMatch(strData, matchData.index);
      permission.numLine = numLine;
      permission.status =
        permissions.length >= 1
          ? PermissionStatus.DUPLICATE
          : validateSeverity(
              data.severity,
              data.values.includes(matchData[groupRegexPos])
            );
      permissions.push({ ...permission });
    }
    owaspValidate.push(
      ...(permissions.length > 0 ? permissions : [permission])
    );
  }
  return owaspValidate;
};
export default verifyPermissions;
