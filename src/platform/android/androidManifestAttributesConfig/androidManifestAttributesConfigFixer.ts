import fs from 'fs';
import { ANDROID_ATTRIBUTES_RULES } from '@/rules';
import {
  createPermissionRegex,
  getAndroidManifestFile,
  getAndroidManifestPath,
} from './androidManifestAttributesConfigUtils';

const androidManifestAttributesConfigFix = async (currentPath: string) => {
  let readAndroidManifest = await getAndroidManifestFile(currentPath);
  Object.entries(ANDROID_ATTRIBUTES_RULES).forEach(([key, data]) => {
    const regex = createPermissionRegex(key);
    const value = data.values[0];
    if (regex.test(readAndroidManifest)) {
      readAndroidManifest = readAndroidManifest.replace(
        regex,
        `${key}="${value}"`
      );
    } else {
      readAndroidManifest = readAndroidManifest.replace(
        /<application/,
        `<application ${key}="${value}" `
      );
    }
  });
  fs.writeFileSync(
    getAndroidManifestPath(currentPath),
    readAndroidManifest,
    'utf8'
  );
};

export default androidManifestAttributesConfigFix;
