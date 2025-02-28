import path from 'path';
import fs from 'fs';

const RULE = `-assumenosideeffects class android.util.Log {
  public static *** v(...);
  public static *** d(...);
  public static *** i(...);
  public static *** w(...);
  public static *** e(...);
}`;

const verifyProguardConfig = (currentPath: string, { repair = false }) => {
  const proguardFile = path.join(currentPath, 'android/app/proguard-rules.pro');

  if (!fs.existsSync(proguardFile) && !repair) {
    return {
      status: false,
      message: `❌ No se encontró ${proguardFile}`,
    };
  }

  const content = fs.readFileSync(proguardFile, 'utf-8');
  if (!content.includes('assumenosideeffects class android.util.Log')) {
    if (!repair) {
      return {
        status: false,
        message: `Falta configuración en el Proguard para eliminar logs en release.`,
      };
    } else {
      fs.appendFileSync(proguardFile, `\n${RULE}\n`);
      return {
        status: true,
        message:
          '✅ ProGuard ya está configurado para eliminar logs en release.',
      };
    }
  }
  return {
    status: true,
    message: '✅ ProGuard ya está configurado para eliminar logs en release.',
  };
};

export default verifyProguardConfig;
