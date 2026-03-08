import path from 'path';
import androidManifestAttributesConfigAnalyze from '@/platform/android/androidManifestAttributesConfig/androidManifestAttributesConfigAnalyzer';
import androidManifestPermissionAnalyze from '@/platform/android/androidManifestPermission/androidManifestPermissionAnalyzer';
import androidSSLPinningAnalyze from '@/platform/android/androidSSLPinning/androidSSLPinningAnalyzer';
import buildGradleAnalyze from '@/platform/android/buildGradle/buildGradleAnalyzer';
import {
  loadAndroidVariantContext,
  resolveAndroidVariants,
} from '@/platform/android/context/androidVariantContext';
import javaLogsAnalyze from '@/platform/android/javaLogs/javaLogsAnalyzer';
import networkSecurityConfigAnalyze from '@/platform/android/networkSecurityConfig/networkSecurityConfigAnalyzer';
import tabjackingAnalyze from '@/platform/android/tabjacking/tabjackingAnalyzer';
import vulnerableLibrariesAnalyze from '@/platform/android/vulnerableLibraries/VulnerableLibrariesAnalyzer';
import iosAtsAnalyze from '@/platform/ios/ats/iosAtsAnalyzer';
import iosPermissionsAnalyze from '@/platform/ios/permissions/iosPermissionsAnalyzer';
import iosReleaseDebugFlagsAnalyze from '@/platform/ios/releaseDebugFlags/iosReleaseDebugFlagsAnalyzer';
import iosSslPinningAnalyze from '@/platform/ios/sslPinning/iosSslPinningAnalyzer';
import { AuditCliOptions, Finding, VerifyOutput } from '@/types/audit';
import { PdfData, PermissionData } from '@/types/global';
import { resolveAuditOptions } from '@/utils/auditOptions';
import { formatDate } from '@/utils/date';
import { toErrorMessage } from '@/utils/error';
import { getCurrentGitBranch } from '@/utils/git';
import { getJsonAppProject } from '@/utils/jsonAppProject';
import { logger } from '@/utils/logger';
import { generatePDF } from '@/utils/pdf/pdfGenerator';
import transformDataForPdf from '@/utils/pdf/transformDataForPdf';
import { permissionDataToFindings } from '@/utils/report/findings';

const ANDROID_FIXED_RULES = new Set([
  'android:allowBackup',
  'android:installLocation',
  'android:launchMode',
  'minSdkVersion',
  'compileSdkVersion',
  'targetSdkVersion',
  'buildToolsVersion',
  'cleartextTrafficPermitted',
  'Logs en archivos Java',
  'Prevencion contra Tapjacking',
  'SSL Pinning',
]);

const IOS_FIXED_RULES = new Set([
  'iOS ATS',
  'iOS Release Debug Flags',
  'iOS SSL Pinning',
  'NSCameraUsageDescription',
  'NSLocationWhenInUseUsageDescription',
  'NSPhotoLibraryUsageDescription',
]);

const withAnalyzerLog = async <T>(
  analyzerName: string,
  analyzerFn: () => Promise<T>,
  fallbackValue: T
): Promise<T> => {
  try {
    const result = await analyzerFn();
    logger.success(`${analyzerName} analyzed`);
    return result;
  } catch (error) {
    logger.error(`${analyzerName} failed: ${toErrorMessage(error)}`);
    return fallbackValue;
  }
};

const withVariantName = (
  items: PermissionData[],
  variant: string,
  fallbackName: string
): PermissionData[] =>
  items.map(item => ({
    ...item,
    nameFile: `${item.nameFile ?? fallbackName} [${variant}]`,
  }));

const asArray = (item: PermissionData | null): PermissionData[] =>
  item ? [item] : [];

const runAndroidVerification = async (
  currentPath: string,
  includeDevDependencies: boolean
): Promise<VerifyOutput> => {
  const permissionData: PermissionData[] = [];
  const findings: Finding[] = [];
  const variants = await resolveAndroidVariants(currentPath);

  for (const variant of variants) {
    const context = await loadAndroidVariantContext(currentPath);
    const [permissions, attributes, networkConfig] = await Promise.all([
      withAnalyzerLog(
        `AndroidManifest Permissions (${variant})`,
        () => androidManifestPermissionAnalyze(currentPath, context),
        []
      ),
      withAnalyzerLog(
        `AndroidManifest Attributes (${variant})`,
        () => androidManifestAttributesConfigAnalyze(currentPath, context),
        []
      ),
      withAnalyzerLog(
        `Network Security Config (${variant})`,
        () => networkSecurityConfigAnalyze(currentPath, context),
        []
      ),
    ]);

    permissionData.push(
      ...withVariantName(permissions, variant, 'AndroidManifest.xml'),
      ...withVariantName(attributes, variant, 'AndroidManifest.xml'),
      ...withVariantName(networkConfig, variant, 'network_security_config.xml')
    );

    findings.push(
      ...permissionDataToFindings(permissions, 'android', variant, ANDROID_FIXED_RULES),
      ...permissionDataToFindings(attributes, 'android', variant, ANDROID_FIXED_RULES),
      ...permissionDataToFindings(networkConfig, 'android', variant, ANDROID_FIXED_RULES)
    );
  }

  const [javaLogsResult, buildGradleResult, vulnerableLibrariesResult, androidSSLPinningResult, tabjackingResult] =
    await Promise.all([
      withAnalyzerLog('Java Logs', () => javaLogsAnalyze(currentPath), null),
      withAnalyzerLog('Build Gradle', () => buildGradleAnalyze(currentPath), []),
      withAnalyzerLog(
        'Vulnerable Libraries',
        () =>
          vulnerableLibrariesAnalyze(currentPath, {
            includeDevDependencies,
          }),
        null
      ),
      withAnalyzerLog('SSL Pinning', () => androidSSLPinningAnalyze(currentPath), null),
      withAnalyzerLog('Tabjacking', () => tabjackingAnalyze(currentPath), null),
    ]);

  const globalItems = [
    ...buildGradleResult,
    ...asArray(vulnerableLibrariesResult),
    ...asArray(tabjackingResult),
    ...asArray(javaLogsResult),
    ...asArray(androidSSLPinningResult),
  ];

  permissionData.push(...globalItems);
  findings.push(
    ...permissionDataToFindings(
      buildGradleResult,
      'android',
      'global',
      ANDROID_FIXED_RULES
    ),
    ...permissionDataToFindings(
      asArray(vulnerableLibrariesResult),
      'android',
      'global',
      ANDROID_FIXED_RULES
    ),
    ...permissionDataToFindings(
      asArray(tabjackingResult),
      'android',
      'global',
      ANDROID_FIXED_RULES
    ),
    ...permissionDataToFindings(
      asArray(javaLogsResult),
      'android',
      'global',
      ANDROID_FIXED_RULES
    ),
    ...permissionDataToFindings(
      asArray(androidSSLPinningResult),
      'android',
      'global',
      ANDROID_FIXED_RULES
    )
  );

  return { permissionData, findings };
};

const runIosVerification = async (currentPath: string): Promise<VerifyOutput> => {
  const permissionData: PermissionData[] = [];
  const findings: Finding[] = [];

  const [ats, debugFlags, sslPinning, permissions] = await Promise.all([
    withAnalyzerLog('iOS ATS', () => iosAtsAnalyze(currentPath), null),
    withAnalyzerLog(
      'iOS Release Debug Flags',
      () => iosReleaseDebugFlagsAnalyze(currentPath),
      null
    ),
    withAnalyzerLog('iOS SSL Pinning', () => iosSslPinningAnalyze(currentPath), null),
    withAnalyzerLog('iOS Permissions', () => iosPermissionsAnalyze(currentPath), []),
  ]);

  const iosItems = [
    ...asArray(ats),
    ...asArray(debugFlags),
    ...asArray(sslPinning),
    ...permissions,
  ];

  permissionData.push(...iosItems);
  findings.push(
    ...permissionDataToFindings(asArray(ats), 'ios', 'default', IOS_FIXED_RULES),
    ...permissionDataToFindings(
      asArray(debugFlags),
      'ios',
      'default',
      IOS_FIXED_RULES
    ),
    ...permissionDataToFindings(
      asArray(sslPinning),
      'ios',
      'default',
      IOS_FIXED_RULES
    ),
    ...permissionDataToFindings(permissions, 'ios', 'default', IOS_FIXED_RULES)
  );

  return { permissionData, findings };
};

export const verify = async (
  currentPath: string,
  cliOptions: AuditCliOptions = {}
): Promise<VerifyOutput> => {
  const startTime = Date.now();
  const options = await resolveAuditOptions(currentPath, cliOptions);

  logger.section('OWASP Security Verification');
  logger.info(`Analyzing project: ${currentPath}`);

  const permissionData: PermissionData[] = [];
  const findings: Finding[] = [];

  if (options.platform === 'android' || options.platform === 'all') {
    const androidResult = await runAndroidVerification(
      currentPath,
      options.includeDevDependencies
    );
    permissionData.push(...androidResult.permissionData);
    findings.push(...androidResult.findings);
  }

  if (options.platform === 'ios' || options.platform === 'all') {
    const iosResult = await runIosVerification(currentPath);
    permissionData.push(...iosResult.permissionData);
    findings.push(...iosResult.findings);
  }

  const appProject = getJsonAppProject(currentPath);
  const currentBranch = await getCurrentGitBranch(currentPath);

  const dataForPdf = transformDataForPdf(permissionData);
  const pdfData: PdfData = {
    appName: appProject.displayName,
    currentBranch,
    date: formatDate(new Date()),
    ...dataForPdf,
  };

  await generatePDF(pdfData, currentPath);
  logger.info(`Report generated: ${path.join(currentPath, 'owasp-bp.pdf')}`);

  const durationSeconds = ((Date.now() - startTime) / 1000).toFixed(2);
  logger.success(`Verification completed in ${durationSeconds} seconds`);

  return {
    findings,
    permissionData,
  };
};
