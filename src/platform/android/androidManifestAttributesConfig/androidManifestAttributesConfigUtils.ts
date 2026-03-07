import { cleanXmlComentaries } from '@/utils/tool';
import fs from 'fs';
import path from 'path';

export const androidManifestName = 'AndroidManifest.xml';

export const getAndroidManifestPath = (
  currentPath: string,
  sourceSet: string = 'main'
) =>
  path.join(currentPath, 'android', 'app', 'src', sourceSet, androidManifestName);

export const getAndroidManifestFile = async (
  currentPath: string,
  sourceSet: string = 'main'
) => {
  const androidManifestFilePath = getAndroidManifestPath(currentPath, sourceSet);
  const androidManifest = await fs.promises.readFile(
    androidManifestFilePath,
    'utf-8'
  );
  const { comments, newData } = cleanXmlComentaries(androidManifest);
  return { androidManifestWithoutComments: newData, comments };
};

export const createPermissionRegex = (mainKey: string) =>
  new RegExp(`${mainKey}\\s*=\\s*"([^"]+)"`, 'g');
