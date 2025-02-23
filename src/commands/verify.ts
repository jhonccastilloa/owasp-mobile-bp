import androidManifestAttributesConfigAnalyze from '@/platform/android/androidManifestAttributesConfig/androidManifestAttributesConfigAnalyzer';
import androidManifestPermissionAnalyze from '@/platform/android/androidManifestPermission/androidManifestPermissionAnalyzer';
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
  console.log('Starting OWASP verification...');
  const androidManifestPermissionResult =
    await androidManifestPermissionAnalyze(currentPath);
  const tabjackingAnalyzeResult = await tabjackingAnalyze(currentPath);
  const androidManifestAttributesConfigResult =
    await androidManifestAttributesConfigAnalyze(currentPath);
  const javaLogsResult = await javaLogsAnalyze(currentPath);
  const buildGradleResult = await buildGradleAnalyze(currentPath);
  const networkSecurityConfigResult = await networkSecurityConfigAnalyze(
    currentPath
  );

  const vulnerableLibrariesResult = await vulnerableLibrariesAnalyze(
    currentPath
  );

  const tabjackingResult = await tabjackingAnalyze(currentPath);
  const appProject = getJsonAppProject(currentPath);
  const dataForPdf = transformDataForPdf([
    ...androidManifestPermissionResult,
    ...androidManifestAttributesConfigResult,
    ...networkSecurityConfigResult,
    ...buildGradleResult,
    tabjackingAnalyzeResult,
    vulnerableLibrariesResult,
    tabjackingResult,
    javaLogsResult,
  ]);

  const pdfData: PdfData = {
    appName: appProject.displayName,
    currentBranch: currentGitBranch,
    date: formatDate(today),
    ...dataForPdf,
  };
  generatePDF(pdfData, currentPath);
  console.log('OWASP verification completed.');
};

export default verify;
