import verifyProguardConfig from './verifyProguardConfig';
import deleteLogsJava from './deleteLogsJava';
import path from 'path';
import { AuditOptions } from '@/types/audit';

const javaLogsFix = async (
  currentPath: string,
  options?: Pick<AuditOptions, 'safe' | 'fixRisky'>
): Promise<void> => {
  verifyProguardConfig(currentPath, { repair: true });
  if (!options?.safe && options?.fixRisky) {
    await deleteLogsJava(path.join(currentPath, 'android'));
  }
};

export default javaLogsFix;
