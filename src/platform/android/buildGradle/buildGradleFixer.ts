import fs from 'fs';
import { BUILD_GRADLE_RULES } from '@/rules/buildGradleRules';
import { recuperateComments } from '@/utils/tool';
import {
  buildGradleRegex,
  getBuildGradleFile,
  getBuildGradlePath,
} from './buildGradleUtils';

const buildGradleFix = async (currentPath: string) => {
  let { buildGradleNoComment, comments } = await getBuildGradleFile(
    currentPath
  );

  Object.entries(BUILD_GRADLE_RULES).forEach(([key, data]) => {
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

export default buildGradleFix;
