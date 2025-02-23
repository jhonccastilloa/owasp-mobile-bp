import { cleanXmlComentaries } from '@/utils/tool';
import fs from 'fs';
import path from 'path';


export const androidManifestName = 'AndroidManifest.xml';

export const getAndroidManifestPath = (currentPath: string) =>
  path.join(currentPath, 'android', 'app', 'src', 'main', androidManifestName);

export const getAndroidManifestFile = async (currentPath: string) => {
  const androidManifestFilePath = getAndroidManifestPath(currentPath);
  const androidManifest = await fs.promises.readFile(
    androidManifestFilePath,
    'utf-8'
  );

  return cleanXmlComentaries(androidManifest).newData;
};

export const createPermissionRegex = (mainKey: string) =>
  new RegExp(`${mainKey}\\s*=\\s*"([^"]+)"`, 'g');
