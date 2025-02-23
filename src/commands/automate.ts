import androidManifestAttributesConfigFix from '@/platform/android/androidManifestAttributesConfig/androidManifestAttributesConfigFixer';
import buildGradleFix from '@/platform/android/buildGradle/buildGradleFixer';
import javaLogsFix from '@/platform/android/javaLogs/javaLogsFixer';
import networkSecurityConfigFix from '@/platform/android/networkSecurityConfig/networkSecurityConfigFixer';

const automate = (currentPath: string) => {
  console.log('Starting OWASP automation...');
  androidManifestAttributesConfigFix(currentPath);
  console.log('✅ Permisos reparados.');
  buildGradleFix(currentPath);
  console.log('✅ Build Gradle reparado.');
  networkSecurityConfigFix(currentPath);
  console.log('✅ Network Security Config reparado.');
  javaLogsFix(currentPath);
  console.log('✅ ProGuard ya está configurado para eliminar logs en release.');
  // console.log('OWASP automation completed.')
};

export default automate;
