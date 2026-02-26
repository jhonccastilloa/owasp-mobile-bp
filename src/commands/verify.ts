import androidManifestAttributesConfigAnalyze from '@/platform/android/androidManifestAttributesConfig/androidManifestAttributesConfigAnalyzer';
import androidManifestPermissionAnalyze from '@/platform/android/androidManifestPermission/androidManifestPermissionAnalyzer';
import androidSSLPinningAnalyze from '@/platform/android/androidSSLPinning/androidSSLPinningAnalyzer';
import buildGradleAnalyze from '@/platform/android/buildGradle/buildGradleAnalyzer';
import javaLogsAnalyze from '@/platform/android/javaLogs/javaLogsAnalyzer';
import networkSecurityConfigAnalyze from '@/platform/android/networkSecurityConfig/networkSecurityConfigAnalyzer';
import tabjackingAnalyze from '@/platform/android/tabjacking/tabjackingAnalyzer';
import vulnerableLibrariesAnalyze from '@/platform/android/vulnerableLibraries/VulnerableLibrariesAnalyzer';
import { PdfData } from '@/types/global';
import { formatDate, today } from '@/utils/date';
import { currentGitBranch } from '@/utils/git';
import { getJsonAppProject } from '@/utils/jsonAppProject';
import { generatePDF } from '@/utils/pdf/pdfGenerator';
import transformDataForPdf from '@/utils/pdf/transformDataForPdf';
import { logger } from '@/utils/logger';

export const verify = async (currentPath: string) => {
  const startTime = Date.now();
  logger.section('OWASP Security Verification');
  logger.info(`Analyzing project: ${currentPath}`);

  const [
    androidManifestPermissionResult,
    androidManifestAttributesConfigResult,
    javaLogsResult,
    buildGradleResult,
    networkSecurityConfigResult,
    vulnerableLibrariesResult,
    androidSSLPinningResult,
    tabjackingResult,
  ] = await Promise.all([
    (async () => {
      const res = await androidManifestPermissionAnalyze(currentPath);
      logger.success('AndroidManifest Permissions analyzed');
      return res;
    })(),
    (async () => {
      const res = await androidManifestAttributesConfigAnalyze(currentPath);
      logger.success('AndroidManifest Attributes analyzed');
      return res;
    })(),
    (async () => {
      const res = await javaLogsAnalyze(currentPath);
      logger.success('Java Logs analyzed');
      return res;
    })(),
    (async () => {
      const res = await buildGradleAnalyze(currentPath);
      logger.success('Build Gradle analyzed');
      return res;
    })(),
    (async () => {
      const res = await networkSecurityConfigAnalyze(currentPath);
      logger.success('Network Security Config analyzed');
      return res;
    })(),
    (async () => {
      const res = await vulnerableLibrariesAnalyze(currentPath);
      logger.success('Vulnerable Libraries analyzed');
      return res;
    })(),
    (async () => {
      const res = await androidSSLPinningAnalyze(currentPath);
      logger.success('SSL Pinning analyzed');
      return res;
    })(),
    (async () => {
      const res = await tabjackingAnalyze(currentPath);
      logger.success('Tabjacking analyzed');
      return res;
    })(),
  ]);

  const appProject = getJsonAppProject(currentPath);

  const dataForPdf = transformDataForPdf([
    ...(Array.isArray(androidManifestPermissionResult) ? androidManifestPermissionResult : []),
    ...(Array.isArray(androidManifestAttributesConfigResult) ? androidManifestAttributesConfigResult : []),
    ...(Array.isArray(networkSecurityConfigResult) ? networkSecurityConfigResult : []),
    ...(Array.isArray(buildGradleResult) ? buildGradleResult : []),
    ...(vulnerableLibrariesResult ? [vulnerableLibrariesResult] : []),
    ...(tabjackingResult ? [tabjackingResult] : []),
    ...(javaLogsResult ? [javaLogsResult] : []),
    ...(androidSSLPinningResult ? [androidSSLPinningResult] : []),
  ]);

  const pdfData: PdfData = {
    appName: appProject.displayName,
    currentBranch: currentGitBranch,
    date: formatDate(today),
    ...dataForPdf,
  };

  generatePDF(pdfData, currentPath);

  const endTime = Date.now();
  const durationSeconds = ((endTime - startTime) / 1000).toFixed(2);

  logger.success(`Verification completed in ${durationSeconds} seconds`);
  logger.info(`Report generated: ${currentPath}/owasp-report.pdf`);
};
