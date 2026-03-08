import path from 'path';
import fs from 'fs';

const getAndroidApplicationId = async (currentPath: string) => {
  const buildGradleAppPath = path.join(
    currentPath,
    'android',
    'app',
    'build.gradle'
  );
  try {
    const fileContent = await fs.promises.readFile(buildGradleAppPath, 'utf8');
    const match = fileContent.match(/applicationId\s+"([^"]+)"/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
};

export default getAndroidApplicationId;
