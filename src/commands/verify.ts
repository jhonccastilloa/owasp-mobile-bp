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

const verify = async (currentPath: string) => {
  const startTime = Date.now();
  console.log('Starting OWASP verification...');

  // Ejecutamos todos los análisis en paralelo
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
      console.log('✅ AndroidManifest Permission analizado.');
      return res;
    })(),
    (async () => {
      const res = await androidManifestAttributesConfigAnalyze(currentPath);
      console.log('✅ AndroidManifest Attributes Config analizado.');
      return res;
    })(),
    (async () => {
      const res = await javaLogsAnalyze(currentPath);
      console.log('✅ Java Logs analizados.');
      return res;
    })(),
    (async () => {
      const res = await buildGradleAnalyze(currentPath);
      console.log('✅ Build Gradle analizado.');
      return res;
    })(),
    (async () => {
      const res = await networkSecurityConfigAnalyze(currentPath);
      console.log('✅ Network Security Config analizado.');
      return res;
    })(),
    (async () => {
      const res = await vulnerableLibrariesAnalyze(currentPath);
      console.log('✅ Librerías vulnerables analizadas.');
      return res;
    })(),
    (async () => {
      const res = await androidSSLPinningAnalyze(currentPath);
      console.log('✅ SSL Pinning analizado.');
      return res;
    })(),
    (async () => {
      const res = await tabjackingAnalyze(currentPath);
      console.log('✅ Tabjacking analizado.');
      return res;
    })(),
  ]);

  const appProject = getJsonAppProject(currentPath);

  const dataForPdf = transformDataForPdf([
    ...androidManifestPermissionResult,
    ...androidManifestAttributesConfigResult,
    ...networkSecurityConfigResult,
    ...buildGradleResult,
    vulnerableLibrariesResult,
    tabjackingResult,
    javaLogsResult,
    androidSSLPinningResult,
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

  console.log(`OWASP verification completed in ${durationSeconds} seconds.`);
};

export default verify;
