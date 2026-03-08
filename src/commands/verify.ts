import androidManifestAttributesConfigAnalyze from '@/platform/android/androidManifestAttributesConfig/androidManifestAttributesConfigAnalyzer';
import androidManifestPermissionAnalyze from '@/platform/android/androidManifestPermission/androidManifestPermissionAnalyzer';
import androidSSLPinningAnalyze from '@/platform/android/androidSSLPinning/androidSSLPinningAnalyzer';
import buildGradleAnalyze from '@/platform/android/buildGradle/buildGradleAnalyzer';
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
import { formatDate, today } from '@/utils/date';
import { getCurrentGitBranch } from '@/utils/git';
import { getJsonAppProject } from '@/utils/jsonAppProject';
import transformDataForPdf from '@/utils/pdf/transformDataForPdf';
import { generatePDF } from '@/utils/pdf/pdfGenerator';
import { logger } from '@/utils/logger';
import { resolveAuditOptions } from '@/utils/auditOptions';
import path from 'path';
import {
  loadAndroidVariantContext,
  resolveAndroidVariants,
} from '@/platform/android/context/androidVariantContext';
import { permissionDataToFindings } from '@/utils/report/findings';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String(error);
};

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
    logger.error(`${analyzerName} failed: ${getErrorMessage(error)}`);
    return fallbackValue;
  }
};

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
        ...permissions.map(item => ({
          ...item,
          nameFile: `${item.nameFile ?? 'AndroidManifest.xml'} [${variant}]`,
        })),
        ...attributes.map(item => ({
          ...item,
          nameFile: `${item.nameFile ?? 'AndroidManifest.xml'} [${variant}]`,
        })),
        ...networkConfig.map(item => ({
          ...item,
          nameFile: `${item.nameFile ?? 'network_security_config.xml'} [${variant}]`,
        }))
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
        withAnalyzerLog('Vulnerable Libraries', () =>
          vulnerableLibrariesAnalyze(currentPath, {
            includeDevDependencies: options.includeDevDependencies,
          }), null),
        withAnalyzerLog('SSL Pinning', () => androidSSLPinningAnalyze(currentPath), null),
        withAnalyzerLog('Tabjacking', () => tabjackingAnalyze(currentPath), null),
      ]);

    permissionData.push(
      ...buildGradleResult,
      ...(vulnerableLibrariesResult ? [vulnerableLibrariesResult] : []),
      ...(tabjackingResult ? [tabjackingResult] : []),
      ...(javaLogsResult ? [javaLogsResult] : []),
      ...(androidSSLPinningResult ? [androidSSLPinningResult] : [])
    );
    findings.push(
      ...permissionDataToFindings(buildGradleResult, 'android', 'global', ANDROID_FIXED_RULES),
      ...(vulnerableLibrariesResult
        ? permissionDataToFindings(
            [vulnerableLibrariesResult],
            'android',
            'global',
            ANDROID_FIXED_RULES
          )
        : []),
      ...(tabjackingResult
        ? permissionDataToFindings(
            [tabjackingResult],
            'android',
            'global',
            ANDROID_FIXED_RULES
          )
        : []),
      ...(javaLogsResult
        ? permissionDataToFindings(
            [javaLogsResult],
            'android',
            'global',
            ANDROID_FIXED_RULES
          )
        : []),
      ...(androidSSLPinningResult
        ? permissionDataToFindings(
            [androidSSLPinningResult],
            'android',
            'global',
            ANDROID_FIXED_RULES
          )
        : [])
    );
  }

  if (options.platform === 'ios' || options.platform === 'all') {
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
    permissionData.push(
      ...(ats ? [ats] : []),
      ...(debugFlags ? [debugFlags] : []),
      ...(sslPinning ? [sslPinning] : []),
      ...permissions
    );
    findings.push(
      ...(ats ? permissionDataToFindings([ats], 'ios', 'default', IOS_FIXED_RULES) : []),
      ...(debugFlags
        ? permissionDataToFindings([debugFlags], 'ios', 'default', IOS_FIXED_RULES)
        : []),
      ...(sslPinning
        ? permissionDataToFindings([sslPinning], 'ios', 'default', IOS_FIXED_RULES)
        : []),
      ...permissionDataToFindings(permissions, 'ios', 'default', IOS_FIXED_RULES)
    );
  }

  const appProject = getJsonAppProject(currentPath);
  const currentBranch = await getCurrentGitBranch(currentPath);

  const dataForPdf = transformDataForPdf(permissionData);
  const pdfData: PdfData = {
    appName: appProject.displayName,
    currentBranch,
    date: formatDate(today),
    ...dataForPdf,
  };
  await generatePDF(pdfData, currentPath);
  logger.info(`Report generated: ${path.join(currentPath, 'owasp-bp.pdf')}`);

  const endTime = Date.now();
  const durationSeconds = ((endTime - startTime) / 1000).toFixed(2);
  logger.success(`Verification completed in ${durationSeconds} seconds`);

  return {
    findings,
    permissionData,
  };
};
