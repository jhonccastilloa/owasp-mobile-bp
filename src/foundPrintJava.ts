import fs from 'fs';
import path from 'path';
import { PermissionData, Report } from './types/global';
import { PermissionStatus } from './types/enums';
import { cleanJavaComments } from './utils/tool';

const LOGS_PATTERNS = [
  'System.out.printf',
  'System.out.println',
  'System.err.println',
  'System.err.print',
  'System.out.format',
];

const searchInFiles = async (directory: string, report: Report[]) => {
  try {
    const files = await fs.promises.readdir(directory);

    const filePromises = files.map(async file => {
      const filePath = path.join(directory, file);

      if (fs.lstatSync(filePath).isDirectory()) {
        await searchInFiles(filePath, report);
      } else if (file.endsWith('.java')) {
        try {
          const data = await fs.promises.readFile(filePath, 'utf8');
          const lines = cleanJavaComments(data).split('\n');
          const findReport: Record<string, Report> = {};

          lines.forEach((line, index) => {
            LOGS_PATTERNS.forEach(pattern => {
              if (line.includes(pattern)) {
                const result: Report = {
                  file: file,
                  line: `${index + 1}`,
                  pattern: pattern,
                };

                if (findReport[file]) {
                  findReport[file].line += `, ${index + 1}`;
                } else {
                  findReport[file] = result;
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
  } catch (err) {
    console.error(`Error leyendo el directorio: ${directory}`, err);
  }
};

const foundPrintJava = async (directory: string) => {
  const report: Report[] = [];
  try {
    await searchInFiles(path.join(directory, 'android'), report);
    const data: PermissionData = {
      numLine: null,
      status:
        report.length === 0 ? PermissionStatus.OK : PermissionStatus.ERROR,
      permission: 'Logs en archivos Java',
      severity: 'E',
      message:
        'No se generaron logs, por lo que no existe información sensible ni datos personales que puedan ser expuestos.                 ',
      owaspCategory: 'M8',
      extraData: report,
    };
    return data;
  } catch (err) {
    console.error('Error durante la búsqueda', err);
  }
};

export default foundPrintJava;
