import verifyProguardConfig from './verifyProguardConfig';
import deleteLogsJava from './deleteLogsJava';
import path from 'path';

const javaLogsFix = async (currentPath: string): Promise<void> => {
  verifyProguardConfig(currentPath, { repair: true });
  await deleteLogsJava(path.join(currentPath, 'android'));
};

export default javaLogsFix;
