import { Report } from '@/types/global';
import { cleanBlockAndLineComment } from '@/utils/tool';
import fs from 'fs';
import path from 'path';
import { LOGS_JAVA_PATTERNS } from './constants';

const searchJavaLogs = async (directory: string): Promise<Report[]> => {
  try {
    const files = await fs.promises.readdir(directory);
    let report: Report[] = [];

    const filePromises = files.map(async file => {
      const filePath = path.join(directory, file);

      if (fs.lstatSync(filePath).isDirectory()) {
        const nestedReport = await searchJavaLogs(filePath);
        report.push(...nestedReport);
      } else if (file.endsWith('.java')) {
        try {
          const data = await fs.promises.readFile(filePath, 'utf8');
          const lines = cleanBlockAndLineComment(data).newData.split('\n');
          const findReport: Record<string, Report> = {};

          lines.forEach((line, index) => {
            LOGS_JAVA_PATTERNS.forEach(pattern => {
              if (line.includes(pattern)) {
                if (findReport[file]) {
                  findReport[file].line += `, ${index + 1}`;
                } else {
                  findReport[file] = { file, line: `${index + 1}`, pattern };
                }
              }
            });
          });

          report.push(...Object.values(findReport));
        } catch (err) {
          console.error(`Error leyendo el archivo: ${filePath}`, err);
        }
      }
    });

    await Promise.all(filePromises);
    return report;
  } catch (err) {
    console.error(`Error leyendo el directorio: ${directory}`, err);
    return [];
  }
};

export default searchJavaLogs;
