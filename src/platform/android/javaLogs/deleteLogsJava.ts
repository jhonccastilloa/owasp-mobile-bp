import { cleanBlockAndLineComment, recuperateComments } from '@/utils/tool';
import fs from 'fs';
import path from 'path';
import { LOGS_JAVA_PATTERNS } from './constants';

const deleteLogsJava = async (directory: string) => {
  try {
    const files = await fs.promises.readdir(directory);

    const filePromises = files.map(async file => {
      const filePath = path.join(directory, file);

      if (fs.lstatSync(filePath).isDirectory()) {
        await deleteLogsJava(filePath);
      } else if (file.endsWith('.java')) {
        const data = await fs.promises.readFile(filePath, 'utf8');
        const { newData, comments } = cleanBlockAndLineComment(data);
        const filteredContent = newData
          .split('\n')
          .filter(
            line => !LOGS_JAVA_PATTERNS.some(pattern => line.includes(pattern))
          )
          .join('\n');
        fs.writeFileSync(
          filePath,
          recuperateComments(filteredContent, comments),
          'utf8'
        );
      }
    });
    await Promise.all(filePromises);
  } catch (err) {
    console.error(`Error leyendo el directorio: ${directory}`, err);
  }
};
export default deleteLogsJava;
