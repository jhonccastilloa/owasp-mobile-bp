import path from 'path';
import searchJavaLogs from './searchJavaLogs';
import verifyProguardConfig from './verifyProguardConfig';
import { PermissionData } from '@/types/global';
import { PermissionStatus } from '@/types/enums';
import fs from 'fs';

const javaLogsAnalyze = async (currentPath: string) => {
  const androidPath = path.join(currentPath, 'android');
  const buildGradleAppPath = path.join(
    currentPath,
    'android',
    'app',
    'build.gradle'
  );
  const regexRasp =
    /implementation\s*\(\s*name:\s*'ShieldSDK',\s*ext:\s*'aar'\s*\)/;
  const buildGradleAppContent = fs.readFileSync(buildGradleAppPath, 'utf-8');
  const javaLogsFound = await searchJavaLogs(androidPath);
  let message = '';
  let status = false;
  if (regexRasp.test(buildGradleAppContent)) {
    status = true;
    message = 'No se encontraron logs en archivos Java.';
  } else {
    const proguard = verifyProguardConfig(currentPath, {});
    status = proguard.status;
    message = proguard.message;
  }

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
