import fs from 'fs';
import path from 'path';

interface OwaspBpConfig {
  hostname: string;
}

const getOwaspBpConfig = async () => {
  try {
    const currentPath = process.cwd();
    const owaspBpConfigPath = path.join(currentPath, 'owasp-bp.config.json');
    const owaspBpConfigFile = await fs.promises.readFile(
      owaspBpConfigPath,
      'utf8'
    );
    const owaspBpConfigJson: OwaspBpConfig = JSON.parse(owaspBpConfigFile);
    return owaspBpConfigJson;
  } catch (error) {
    console.log("🚫 Arhivo 'owasp-bp.config.json' no encontrado.");
    return null;
  }
};

export default getOwaspBpConfig;
