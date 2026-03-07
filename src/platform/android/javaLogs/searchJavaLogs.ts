import { Report } from '@/types/global';
import { cleanBlockAndLineComment } from '@/utils/tool';
import fs from 'fs';
import path from 'path';
import { LOGS_JAVA_PATTERNS } from './constants';
import { logger } from '@/utils/logger';

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
          logger.error(
            `Failed to read file ${filePath}: ${err instanceof Error ? err.message : String(err)}`
          );
        }
      }
    });

    await Promise.all(filePromises);
    return report;
  } catch (err) {
    logger.error(
      `Failed to read directory ${directory}: ${err instanceof Error ? err.message : String(err)}`
    );
    return [];
  }
};

export default searchJavaLogs;
