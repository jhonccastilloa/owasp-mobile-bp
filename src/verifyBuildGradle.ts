import path from 'path';
import fs from 'fs';
import { BUILD_GRADLE_DATA } from './data/buildGradleData';
import verifyPermissions from './verifyPermissions';
import { PermissionData } from './types/global';
import { cleanBlockAndLineComment, recuperateComments } from './utils/tool';

const nameFile = 'build.gradle';

const getBuildGradlePath = (currentPath: string) =>
  path.join(currentPath, 'android', nameFile);

const getBuildGradleFile = async (currentPath: string) => {
  const buildGradleFilePath = getBuildGradlePath(currentPath);
  const buildGradle = await fs.promises.readFile(buildGradleFilePath, 'utf-8');
  const { comments, newData } = cleanBlockAndLineComment(buildGradle);
  return {
    buildGradle,
    buildGradleNoComment: newData,
    comments,
  };
};

const buildGradleRegex = (mainKey: string) =>
  new RegExp(`${mainKey}\\s*=\\s*(\\d+)`, 'g');

const verifyBuildGradle = async (
  currentPath: string
): Promise<PermissionData[]> => {
  const { buildGradleNoComment } = await getBuildGradleFile(currentPath);
  return verifyPermissions({
    strData: buildGradleNoComment,
    regexFn: buildGradleRegex,
    permissions: BUILD_GRADLE_DATA,
    nameFile,
  });
};

export const repairBuildGradle = async (currentPath: string) => {
  let { buildGradleNoComment, comments } = await getBuildGradleFile(
    currentPath
  );

  Object.entries(BUILD_GRADLE_DATA).forEach(([key, data]) => {
    const regex = buildGradleRegex(key);
    const value = data.values[0];
    if (regex.test(buildGradleNoComment)) {
      buildGradleNoComment = buildGradleNoComment.replace(
        regex,
        `${key}=${value}`
      );
    } else {
      buildGradleNoComment = buildGradleNoComment.replace(
        /ext\s*{/,
        `ext { \n\t\t${key}=${value}`
      );
    }
  });

  fs.writeFileSync(
    getBuildGradlePath(currentPath),
    recuperateComments(buildGradleNoComment, comments),
    'utf8'
  );
};

export default verifyBuildGradle;
