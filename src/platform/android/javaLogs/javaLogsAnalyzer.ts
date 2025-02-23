import path from 'path';
import searchJavaLogs from './searchJavaLogs';
import verifyProguardConfig from './verifyProguardConfig';
import { PermissionData } from '@/types/global';
import { PermissionStatus } from '@/types/enums';

const javaLogsAnalyze = async (currentPath: string) => {
  const androidPath = path.join(currentPath, 'android');
  const javaLogsFound = await searchJavaLogs(androidPath);
  const { status, message } = verifyProguardConfig(currentPath, {});

  const data: PermissionData = {
    numLine: null,
    status: status ? PermissionStatus.OK : PermissionStatus.ERROR,
    permission: 'Logs en archivos Java',
    severity: 'E',
    message,
    owaspCategory: 'M8',
    extraData: javaLogsFound,
  };
  return data;
};

export default javaLogsAnalyze;
