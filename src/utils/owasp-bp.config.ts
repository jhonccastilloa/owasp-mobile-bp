import fs from 'fs';
import path from 'path';
import { logger } from './logger';
import { OwaspBpConfig } from '@/types/audit';

const getOwaspBpConfig = async (
  currentPath: string = process.cwd(),
  silent: boolean = false
) => {
  try {
    const owaspBpConfigPath = path.join(currentPath, 'owasp-bp.config.json');
    const owaspBpConfigFile = await fs.promises.readFile(
      owaspBpConfigPath,
      'utf8'
    );
    const owaspBpConfigJson: OwaspBpConfig = JSON.parse(owaspBpConfigFile);
    return owaspBpConfigJson;
  } catch {
    if (!silent) {
      logger.warn("File 'owasp-bp.config.json' not found.");
    }
    return null;
  }
};

export default getOwaspBpConfig;
