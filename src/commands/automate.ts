import androidManifestAttributesConfigFix from '@/platform/android/androidManifestAttributesConfig/androidManifestAttributesConfigFixer';
import androidSSLPinningFix from '@/platform/android/androidSSLPinning/androidSSLPinningFixer';
import buildGradleFix from '@/platform/android/buildGradle/buildGradleFixer';
import javaLogsFix from '@/platform/android/javaLogs/javaLogsFixer';
import networkSecurityConfigFix from '@/platform/android/networkSecurityConfig/networkSecurityConfigFixer';
import tabjackingFix from '@/platform/android/tabjacking/tabjackingFixer';
import { logger } from '@/utils/logger';

export const automate = async (currentPath: string) => {
  const startTime = Date.now();
  logger.section('OWASP Security Automation');
  logger.info(`Fixing issues in: ${currentPath}`);

  await Promise.all([
    (async () => {
      await androidManifestAttributesConfigFix(currentPath);
      logger.success('Permissions fixed');
    })(),
    (async () => {
      await buildGradleFix(currentPath);
      logger.success('Build Gradle fixed');
    })(),
    (async () => {
      await networkSecurityConfigFix(currentPath);
      logger.success('Network Security Config fixed');
    })(),
    (async () => {
      javaLogsFix(currentPath);
      logger.success('ProGuard configured for log removal');
    })(),
    (async () => {
      await tabjackingFix(currentPath);
      logger.success('Tabjacking issues fixed');
    })(),
    (async () => {
      androidSSLPinningFix(currentPath);
      logger.success('SSL Pinning reviewed');
    })(),
  ]);

  const endTime = Date.now();
  const durationSeconds = ((endTime - startTime) / 1000).toFixed(2);

  logger.success(`Automation completed in ${durationSeconds} seconds`);
};
