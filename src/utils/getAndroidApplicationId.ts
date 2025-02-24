import path from 'path';
import fs from 'fs';

const getAndroidApplicationId = async (currentPath: string) => {
  const buildGradleAppPath = path.join(
    currentPath,
    'android',
    'app',
    'build.gradle'
  );
  const fileContent = fs.readFileSync(buildGradleAppPath, 'utf8');
  const match = fileContent.match(/applicationId\s+"([^"]+)"/);
  return match ? match[1] : null;
};

export default getAndroidApplicationId;
