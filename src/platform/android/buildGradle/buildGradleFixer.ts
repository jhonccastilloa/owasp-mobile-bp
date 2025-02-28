import fs from 'fs';
import { BUILD_GRADLE_RULES } from '@/rules/buildGradleRules';
import { recuperateComments } from '@/utils/tool';
import {
  buildGradleFixRegex,
  getBuildGradleFile,
  getBuildGradlePath,
} from './buildGradleUtils';

const buildGradleFix = async (currentPath: string) => {
  let { buildGradleNoComment, comments } = await getBuildGradleFile(
    currentPath
  );

  Object.entries(BUILD_GRADLE_RULES).forEach(([key, data]) => {
    const regex = buildGradleFixRegex(key);
    const value = data.values[0];
    const valueTransform = value.includes('.') ? `"${value}"` : value;
    if (regex.test(buildGradleNoComment)) {
      buildGradleNoComment = buildGradleNoComment.replace(
        regex,
        `${key} = ${valueTransform}`
      );
    } else {
      buildGradleNoComment = buildGradleNoComment.replace(
        /ext\s*{/,
        `ext { \n\t\t${key} = ${valueTransform}`
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
