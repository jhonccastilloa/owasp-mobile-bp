import androidManifestAttributesConfigFix from '@/platform/android/androidManifestAttributesConfig/androidManifestAttributesConfigFixer';
import androidSSLPinningFix from '@/platform/android/androidSSLPinning/androidSSLPinningFixer';
import buildGradleFix from '@/platform/android/buildGradle/buildGradleFixer';
import javaLogsFix from '@/platform/android/javaLogs/javaLogsFixer';
import networkSecurityConfigFix from '@/platform/android/networkSecurityConfig/networkSecurityConfigFixer';
import tabjackingFix from '@/platform/android/tabjacking/tabjackingFixer';

const automate = async (currentPath: string) => {
  console.log('Starting OWASP automation...');

  const startTime = Date.now();

  // lanzamos todas en paralelo
  await Promise.all([
    (async () => {
      await androidManifestAttributesConfigFix(currentPath);
      console.log('✅ Permisos reparados.');
    })(),
    (async () => {
      await buildGradleFix(currentPath);
      console.log('✅ Build Gradle reparado.');
    })(),
    (async () => {
      await networkSecurityConfigFix(currentPath);
      console.log('✅ Network Security Config reparado.');
    })(),
    (async () => {
      javaLogsFix(currentPath); // si esta no es async, no necesita await
      console.log(
        '✅ ProGuard ya está configurado para eliminar logs en release.'
      );
    })(),
    (async () => {
      await tabjackingFix(currentPath);
      console.log('✅ Tabjacking reparado.');
    })(),
    (async () => {
      androidSSLPinningFix(currentPath); // igual, si no devuelve promesa no necesita await
      console.log('✅ SSL Pinning revisado.');
    })(),
  ]);

  const endTime = Date.now();
  const durationSeconds = ((endTime - startTime) / 1000).toFixed(2);

  console.log(`OWASP automation completed in ${durationSeconds} seconds.`);
};

export default automate;
