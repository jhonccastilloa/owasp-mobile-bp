import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import androidManifestAttributesConfigAnalyze from '@/platform/android/androidManifestAttributesConfig/androidManifestAttributesConfigAnalyzer';
import androidManifestAttributesConfigFix from '@/platform/android/androidManifestAttributesConfig/androidManifestAttributesConfigFixer';
import androidManifestPermissionAnalyze from '@/platform/android/androidManifestPermission/androidManifestPermissionAnalyzer';
import fixAndroidManifestPermissions from '@/platform/android/androidManifestPermission/androidManifestPermissionFixer';
import {
  fixAndroidLegacyPermissions,
  getAutoRemovableManifestPermissions,
} from '@/platform/android/androidManifestPermission/androidLegacyPermissionFixer';
import { fixAndroidStorageLegacyPermissions } from '@/platform/android/androidManifestPermission/androidStoragePermissionFixer';
import androidSSLPinningAnalyze from '@/platform/android/androidSSLPinning/androidSSLPinningAnalyzer';
import androidSSLPinningFix from '@/platform/android/androidSSLPinning/androidSSLPinningFixer';
import { getSSLPinningFile } from '@/platform/android/androidSSLPinning/androidSSLPinningUtils';
import buildGradleAnalyze from '@/platform/android/buildGradle/buildGradleAnalyzer';
import buildGradleFix from '@/platform/android/buildGradle/buildGradleFixer';
import { getBuildGradlePath } from '@/platform/android/buildGradle/buildGradleUtils';
import {
  loadAndroidVariantContext,
  AndroidVariantContext,
} from '@/platform/android/context/androidVariantContext';
import javaLogsAnalyze from '@/platform/android/javaLogs/javaLogsAnalyzer';
import javaLogsFix from '@/platform/android/javaLogs/javaLogsFixer';
import networkSecurityConfigAnalyze from '@/platform/android/networkSecurityConfig/networkSecurityConfigAnalyzer';
import networkSecurityConfigFix from '@/platform/android/networkSecurityConfig/networkSecurityConfigFixer';
import { readNetworkSecurityConfig } from '@/platform/android/networkSecurityConfig/networkSecurityConfigUtils';
import tabjackingAnalyze from '@/platform/android/tabjacking/tabjackingAnalyzer';
import tabjackingFix from '@/platform/android/tabjacking/tabjackingFixer';
import vulnerableLibrariesAnalyze from '@/platform/android/vulnerableLibraries/VulnerableLibrariesAnalyzer';
import iosAtsAnalyze from '@/platform/ios/ats/iosAtsAnalyzer';
import iosAtsFix from '@/platform/ios/ats/iosAtsFixer';
import iosPermissionsAnalyze from '@/platform/ios/permissions/iosPermissionsAnalyzer';
import iosPermissionsFix from '@/platform/ios/permissions/iosPermissionsFixer';
import iosReleaseDebugFlagsAnalyze from '@/platform/ios/releaseDebugFlags/iosReleaseDebugFlagsAnalyzer';
import iosReleaseDebugFlagsFix from '@/platform/ios/releaseDebugFlags/iosReleaseDebugFlagsFixer';
import iosSslPinningAnalyze from '@/platform/ios/sslPinning/iosSslPinningAnalyzer';
import iosSslPinningFix from '@/platform/ios/sslPinning/iosSslPinningFixer';
import { findTrustKitConfigFile } from '@/platform/ios/sslPinning/iosTrustKitUtils';
import {
  findProjectPbxproj,
  resolveProductionInfoPlist,
} from '@/platform/ios/utils/iosFiles';
import {
  AuditCliOptions,
  AuditOptions,
  AutomationBeforeAfter,
  AutomationRuleResult,
  AutomationRisk,
  AutomationRunReport,
  AutomationSkipReasonCode,
} from '@/types/audit';
import { PermissionData } from '@/types/global';
import { resolveAuditOptions } from '@/utils/auditOptions';
import { formatDate } from '@/utils/date';
import { getCurrentGitBranch } from '@/utils/git';
import { getJsonAppProject } from '@/utils/jsonAppProject';
import { logger } from '@/utils/logger';
import { generateAutomationPDF } from '@/utils/pdf/automationPdfGenerator';
import { getAutomationSummary } from '@/utils/report/automationSummary';
import { getAndroidManifestPath } from '@/platform/android/androidManifestAttributesConfig/androidManifestAttributesConfigUtils';
import { getMainActivityJava, getMainApplication } from '@/utils/androidFiles';

type AnalyzeOutput = PermissionData | PermissionData[] | null;

interface AnalysisSnapshot {
  compliant: boolean;
  summary: string;
}

interface AutomationTaskDefinition {
  ruleId: string;
  platform: 'android' | 'ios';
  risk: AutomationRisk;
  manualAction: string;
  analyze: () => Promise<AnalyzeOutput>;
  fix: () => Promise<void>;
  collectFiles: () => Promise<string[]>;
  shouldSkip?: (options: AuditOptions) => boolean;
  skipReason?: {
    code: AutomationSkipReasonCode;
    message: string;
  };
}

const LEGACY_STORAGE_PERMISSIONS = new Set([
  'READ_EXTERNAL_STORAGE',
  'WRITE_EXTERNAL_STORAGE',
]);
const LEGACY_AUTO_REMOVABLE_PERMISSIONS = new Set(
  getAutoRemovableManifestPermissions()
);

const stringifyMessage = (message: PermissionData['message']): string => {
  if (typeof message === 'string') return message;
  return message
    .map(item => (typeof item === 'string' ? item : (item.text ?? '').toString()))
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
};

const summarizeAnalyzeOutput = (output: AnalyzeOutput): AnalysisSnapshot => {
  if (!output) {
    return {
      compliant: false,
      summary: 'No analyzer data available.',
    };
  }

  if (Array.isArray(output)) {
    if (output.length === 0) {
      return { compliant: true, summary: 'No findings.' };
    }

    const compliant = output.every(item => item.status === 'OK');
    const summary = output
      .map(item => `${item.permission}: ${item.status} (${stringifyMessage(item.message)})`)
      .join(' | ');
    return { compliant, summary };
  }

  return {
    compliant: output.status === 'OK',
    summary: `${output.permission}: ${output.status} (${stringifyMessage(output.message)})`,
  };
};

const hashContent = (content: string) =>
  crypto.createHash('sha256').update(content).digest('hex');

const getFileHash = async (filePath: string): Promise<string | null> => {
  try {
    const content = await fs.promises.readFile(filePath, 'utf8');
    return hashContent(content);
  } catch {
    return null;
  }
};

const createFileSnapshot = async (filePaths: string[]) => {
  const normalized = [...new Set(filePaths.filter(Boolean))];
  const snapshot = new Map<string, string | null>();
  for (const filePath of normalized) {
    snapshot.set(filePath, await getFileHash(filePath));
  }
  return snapshot;
};

const computeChangedFiles = (
  before: Map<string, string | null>,
  after: Map<string, string | null>
) => {
  const changed: string[] = [];
  const keys = new Set([...before.keys(), ...after.keys()]);
  for (const key of keys) {
    if ((before.get(key) ?? null) !== (after.get(key) ?? null)) {
      changed.push(key);
    }
  }
  return changed;
};

const getBeforeAfterEvidence = (
  pre: AnalysisSnapshot,
  post: AnalysisSnapshot,
  files: string[],
  beforeSnapshot: Map<string, string | null>,
  afterSnapshot: Map<string, string | null>
): AutomationBeforeAfter[] => {
  const evidence: AutomationBeforeAfter[] = [
    {
      file: 'status',
      before: pre.summary,
      after: post.summary,
    },
  ];

  for (const file of files) {
    const beforeHash = beforeSnapshot.get(file) ?? null;
    const afterHash = afterSnapshot.get(file) ?? null;
    if (beforeHash === afterHash) continue;
    evidence.push({
      file,
      before: beforeHash ? beforeHash.slice(0, 12) : 'missing',
      after: afterHash ? afterHash.slice(0, 12) : 'missing',
    });
  }

  return evidence;
};

const getReasonCode = (message: string): AutomationSkipReasonCode => {
  const msg = message.toLowerCase();
  if (msg.includes('hostname') || msg.includes('config')) return 'MISSING_CONFIG';
  if (msg.includes('pattern')) return 'PATTERN_NOT_FOUND';
  if (msg.includes('not found') || msg.includes('no se encontró') || msg.includes('no se ha encontrado')) {
    return 'FILE_NOT_FOUND';
  }
  return 'MANUAL_REVIEW_REQUIRED';
};

const executeTask = async (
  task: AutomationTaskDefinition,
  options: AuditOptions
): Promise<AutomationRuleResult> => {
  const startTime = Date.now();
  try {
    if (task.shouldSkip?.(options)) {
      return {
        ruleId: task.ruleId,
        platform: task.platform,
        status: 'SKIPPED',
        risk: task.risk,
        filesChanged: [],
        beforeAfter: [],
        reasonCode: task.skipReason?.code ?? 'MANUAL_REVIEW_REQUIRED',
        reasonMessage: task.skipReason?.message ?? 'Skipped by execution policy.',
        manualAction: task.manualAction,
        durationMs: Date.now() - startTime,
      };
    }

    const preAnalyze = summarizeAnalyzeOutput(await task.analyze());
    if (preAnalyze.compliant) {
      return {
        ruleId: task.ruleId,
        platform: task.platform,
        status: 'ALREADY_COMPLIANT',
        risk: task.risk,
        filesChanged: [],
        beforeAfter: [
          {
            file: 'status',
            before: preAnalyze.summary,
            after: preAnalyze.summary,
          },
        ],
        manualAction: task.manualAction,
        durationMs: Date.now() - startTime,
      };
    }

    const files = await task.collectFiles();
    const beforeSnapshot = await createFileSnapshot(files);

    await task.fix();

    const afterSnapshot = await createFileSnapshot(files);
    const changedFiles = computeChangedFiles(beforeSnapshot, afterSnapshot);
    const postAnalyze = summarizeAnalyzeOutput(await task.analyze());
    const beforeAfter = getBeforeAfterEvidence(
      preAnalyze,
      postAnalyze,
      changedFiles,
      beforeSnapshot,
      afterSnapshot
    );

    if (postAnalyze.compliant) {
      return {
        ruleId: task.ruleId,
        platform: task.platform,
        status: changedFiles.length > 0 ? 'FIXED' : 'ALREADY_COMPLIANT',
        risk: task.risk,
        filesChanged: changedFiles,
        beforeAfter,
        manualAction: task.manualAction,
        durationMs: Date.now() - startTime,
      };
    }

    const reasonMessage = postAnalyze.summary;
    return {
      ruleId: task.ruleId,
      platform: task.platform,
      status: 'SKIPPED',
      risk: task.risk,
      filesChanged: changedFiles,
      beforeAfter,
      reasonCode: getReasonCode(reasonMessage),
      reasonMessage,
      manualAction: task.manualAction,
      durationMs: Date.now() - startTime,
    };
  } catch (error) {
    const reasonMessage = error instanceof Error ? error.message : String(error);
    return {
      ruleId: task.ruleId,
      platform: task.platform,
      status: 'FAILED',
      risk: task.risk,
      filesChanged: [],
      beforeAfter: [],
      reasonCode: getReasonCode(reasonMessage),
      reasonMessage,
      manualAction: task.manualAction,
      durationMs: Date.now() - startTime,
    };
  }
};

const buildAndroidTasks = (
  currentPath: string,
  context: AndroidVariantContext,
  options: AuditOptions
): AutomationTaskDefinition[] => [
  {
    ruleId: 'android.manifest.attributes',
    platform: 'android',
    risk: 'low',
    manualAction:
      'Review android/app/src/main/AndroidManifest.xml attributes manually and rerun verify.',
    analyze: () => androidManifestAttributesConfigAnalyze(currentPath, context),
    fix: () => androidManifestAttributesConfigFix(currentPath, context, options),
    collectFiles: async () => [getAndroidManifestPath(currentPath, 'main')],
  },
  {
    ruleId: 'android.network.security',
    platform: 'android',
    risk: 'low',
    manualAction:
      'Review network security config XML in src/main and enforce cleartextTrafficPermitted=false.',
    analyze: () => networkSecurityConfigAnalyze(currentPath, context),
    fix: () => networkSecurityConfigFix(currentPath, context),
    collectFiles: async () => {
      const networkConfig = await readNetworkSecurityConfig(currentPath, context);
      if (networkConfig.networkSecurityConfigPath) {
        return [networkConfig.networkSecurityConfigPath];
      }
      return [getAndroidManifestPath(currentPath, 'main')];
    },
  },
  {
    ruleId: 'android.build.gradle',
    platform: 'android',
    risk: 'low',
    manualAction: 'Review android/build.gradle SDK versions manually.',
    analyze: () => buildGradleAnalyze(currentPath),
    fix: () => buildGradleFix(currentPath),
    collectFiles: async () => [getBuildGradlePath(currentPath)],
  },
  {
    ruleId: 'android.manifest.permissions',
    platform: 'android',
    risk: 'medium',
    manualAction:
      'Review AndroidManifest permissions manually and remove unnecessary permissions.',
    analyze: async () =>
      (await androidManifestPermissionAnalyze(currentPath, context)).filter(
        item =>
          !LEGACY_STORAGE_PERMISSIONS.has(item.permission) &&
          !LEGACY_AUTO_REMOVABLE_PERMISSIONS.has(item.permission)
      ),
    fix: () => fixAndroidManifestPermissions(currentPath),
    collectFiles: async () => [getAndroidManifestPath(currentPath, 'main')],
  },
  {
    ruleId: 'android.manifest.storage.permissions',
    platform: 'android',
    risk: 'medium',
    manualAction:
      'Review storage access flow and confirm READ_MEDIA_* permissions after migration.',
    analyze: async () =>
      (await androidManifestPermissionAnalyze(currentPath, context)).filter(item =>
        LEGACY_STORAGE_PERMISSIONS.has(item.permission)
      ),
    fix: () => fixAndroidStorageLegacyPermissions(currentPath),
    collectFiles: async () => [getAndroidManifestPath(currentPath, 'main')],
  },
  {
    ruleId: 'android.manifest.legacy.permissions',
    platform: 'android',
    risk: 'medium',
    manualAction:
      'Review removed legacy permissions and validate runtime behavior on API 33+.',
    analyze: async () =>
      (await androidManifestPermissionAnalyze(currentPath, context)).filter(item =>
        LEGACY_AUTO_REMOVABLE_PERMISSIONS.has(item.permission)
      ),
    fix: () => fixAndroidLegacyPermissions(currentPath),
    collectFiles: async () => [getAndroidManifestPath(currentPath, 'main')],
  },
  {
    ruleId: 'android.java.logs',
    platform: 'android',
    risk: 'medium',
    manualAction:
      'Review Java logs and Proguard settings manually if still non-compliant.',
    analyze: () => javaLogsAnalyze(currentPath),
    fix: () => javaLogsFix(currentPath),
    collectFiles: async () => [path.join(currentPath, 'android', 'app', 'proguard-rules.pro')],
  },
  {
    ruleId: 'android.tabjacking',
    platform: 'android',
    risk: 'low',
    manualAction: 'Review MainActivity and add touch obscured filtering manually.',
    analyze: () => tabjackingAnalyze(currentPath),
    fix: () => tabjackingFix(currentPath),
    collectFiles: async () => {
      const { mainActivityPath } = await getMainActivityJava(currentPath);
      return mainActivityPath ? [mainActivityPath] : [];
    },
  },
  {
    ruleId: 'android.ssl.pinning',
    platform: 'android',
    risk: 'medium',
    manualAction:
      "Ensure hostname exists in owasp-bp.config.json and validate generated SSL pinning factory manually.",
    analyze: () => androidSSLPinningAnalyze(currentPath),
    fix: () => androidSSLPinningFix(currentPath),
    collectFiles: async () => {
      const { mainApplicationPath } = await getMainApplication(currentPath);
      const { SSLPinningFilePath } = await getSSLPinningFile(currentPath);
      return [mainApplicationPath, SSLPinningFilePath].filter(
        (value): value is string => Boolean(value)
      );
    },
  },
];

const buildIosTasks = (
  currentPath: string,
  options: AuditOptions
): AutomationTaskDefinition[] => [
  {
    ruleId: 'ios.ats',
    platform: 'ios',
    risk: 'low',
    manualAction: 'Review NSAppTransportSecurity in Info.plist.',
    analyze: () => iosAtsAnalyze(currentPath),
    fix: () => iosAtsFix(currentPath),
    collectFiles: async () => {
      const plist = await resolveProductionInfoPlist(currentPath);
      return plist.ok ? [plist.filePath] : [];
    },
  },
  {
    ruleId: 'ios.release.debug.flags',
    platform: 'ios',
    risk: 'low',
    manualAction: 'Review Release build settings in project.pbxproj.',
    analyze: () => iosReleaseDebugFlagsAnalyze(currentPath),
    fix: () => iosReleaseDebugFlagsFix(currentPath),
    collectFiles: async () => {
      const pbxproj = await findProjectPbxproj(currentPath);
      return pbxproj ? [pbxproj.filePath] : [];
    },
  },
  {
    ruleId: 'ios.ssl.pinning',
    platform: 'ios',
    risk: 'medium',
    manualAction: 'Review TrustKit configuration and pinned hashes in AppDelegate.swift.',
    analyze: () => iosSslPinningAnalyze(currentPath),
    fix: () => iosSslPinningFix(currentPath),
    collectFiles: async () => {
      const trustKitFile = await findTrustKitConfigFile(currentPath);
      return trustKitFile ? [trustKitFile.filePath] : [];
    },
  },
  {
    ruleId: 'ios.permissions',
    platform: 'ios',
    risk: 'medium',
    manualAction:
      'Add required NS*UsageDescription keys manually if missing in Info.plist.',
    analyze: () => iosPermissionsAnalyze(currentPath),
    fix: () => iosPermissionsFix(currentPath),
    collectFiles: async () => {
      const plist = await resolveProductionInfoPlist(currentPath);
      return plist.ok ? [plist.filePath] : [];
    },
  },
];

const buildAnalyzeOnlyResults = async (
  currentPath: string,
  context: AndroidVariantContext,
  options: AuditOptions
): Promise<AutomationRuleResult[]> => {
  const results: AutomationRuleResult[] = [];
  if (options.platform === 'android' || options.platform === 'all') {
    const [vulnerableLibraries] = await Promise.all([
      vulnerableLibrariesAnalyze(currentPath, {
        includeDevDependencies: options.includeDevDependencies,
      }),
    ]);

    const vulnerableSummary = summarizeAnalyzeOutput(vulnerableLibraries);
    results.push({
      ruleId: 'android.vulnerable.libraries',
      platform: 'android',
      status: vulnerableSummary.compliant ? 'ALREADY_COMPLIANT' : 'SKIPPED',
      risk: 'high',
      filesChanged: [],
      beforeAfter: [
        {
          file: 'status',
          before: vulnerableSummary.summary,
          after: vulnerableSummary.summary,
        },
      ],
      reasonCode: vulnerableSummary.compliant ? undefined : 'NOT_SUPPORTED',
      reasonMessage: vulnerableSummary.compliant
        ? undefined
        : 'This rule is analyze-only and requires dependency upgrades.',
      manualAction:
        'Upgrade or remove vulnerable dependencies and rerun verify.',
      durationMs: 0,
    });
  }

  return results;
};

const buildCommandLine = (currentPath: string, options: AuditOptions) => {
  const args = [
    'owasp-bp automate',
    `--path ${currentPath}`,
    `--platform ${options.platform}`,
    options.includeDevDependencies ? '--include-dev-dependencies' : '',
  ].filter(Boolean);
  return args.join(' ');
};

export const automate = async (
  currentPath: string,
  cliOptions: AuditCliOptions = {}
) => {
  const startTime = Date.now();
  const options = await resolveAuditOptions(currentPath, cliOptions);
  const context = await loadAndroidVariantContext(currentPath);

  logger.section('OWASP Security Automation');
  logger.info(`Fixing issues in: ${currentPath}`);

  const tasks: AutomationTaskDefinition[] = [];
  if (options.platform === 'android' || options.platform === 'all') {
    tasks.push(...buildAndroidTasks(currentPath, context, options));
  }
  if (options.platform === 'ios' || options.platform === 'all') {
    tasks.push(...buildIosTasks(currentPath, options));
  }

  const results: AutomationRuleResult[] = [];
  for (const task of tasks) {
    logger.info(`Running automation rule: ${task.ruleId}`);
    const ruleResult = await executeTask(task, options);
    results.push(ruleResult);
    if (ruleResult.status === 'FAILED') {
      logger.error(`${task.ruleId} failed`);
    } else if (ruleResult.status === 'SKIPPED') {
      logger.warn(`${task.ruleId} skipped`);
    } else {
      logger.success(`${task.ruleId} ${ruleResult.status.toLowerCase()}`);
    }
  }

  results.push(...(await buildAnalyzeOnlyResults(currentPath, context, options)));

  const appProject = getJsonAppProject(currentPath);
  const currentBranch = await getCurrentGitBranch(currentPath);
  const report: AutomationRunReport = {
    appName: appProject.displayName,
    currentBranch,
    generatedAt: formatDate(new Date()),
    command: buildCommandLine(currentPath, options),
    options: {
      platform: options.platform,
      includeDevDependencies: options.includeDevDependencies,
    },
    summary: getAutomationSummary(results),
    results,
  };

  const pdfPath = await generateAutomationPDF(report, currentPath);
  logger.info(`Automation PDF report generated: ${pdfPath}`);

  const failedRules = results.filter(result => result.status === 'FAILED');
  const endTime = Date.now();
  const durationSeconds = ((endTime - startTime) / 1000).toFixed(2);
  logger.success(`Automation completed in ${durationSeconds} seconds`);

  if (failedRules.length > 0) {
    throw new Error(`${failedRules.length} automation rule(s) failed`);
  }
};
