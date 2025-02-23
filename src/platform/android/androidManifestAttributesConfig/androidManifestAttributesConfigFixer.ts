import fs from 'fs';
import { ANDROID_ATTRIBUTES_RULES } from '@/rules';
import {
  createPermissionRegex,
  getAndroidManifestFile,
  getAndroidManifestPath,
} from './androidManifestAttributesConfigUtils';
import { recuperateComments } from '@/utils/tool';

const androidManifestAttributesConfigFix = async (currentPath: string) => {
  let { androidManifestWithoutComments, comments } =
    await getAndroidManifestFile(currentPath);
  Object.entries(ANDROID_ATTRIBUTES_RULES).forEach(([key, data]) => {
    const regex = createPermissionRegex(key);
    const value = data.values[0];
    if (regex.test(androidManifestWithoutComments)) {
      androidManifestWithoutComments = androidManifestWithoutComments.replace(
        regex,
        `${key}="${value}"`
      );
    } else {
      androidManifestWithoutComments = androidManifestWithoutComments.replace(
        /<application/,
        `<application ${key}="${value}" `
      );
    }
  });
  fs.writeFileSync(
    getAndroidManifestPath(currentPath),
    recuperateComments(androidManifestWithoutComments, comments),
    'utf8'
  );
};

export default androidManifestAttributesConfigFix;
