import fs from 'fs';
import path from 'path';
import { PermissionData, Report } from './types/global';
import { PermissionStatus } from './types/enums';

const searchPatterns = [
  'System.out.printf',
  'System.out.println',
  'System.err.println',
];

const searchInFiles = async (directory: string, report: any[]) => {
  try {
    const files = await fs.promises.readdir(directory);

    const filePromises = files.map(async file => {
      const filePath = path.join(directory, file);

      if (fs.lstatSync(filePath).isDirectory()) {
        await searchInFiles(filePath, report);
      } else if (file.endsWith('.java')) {
        try {
          const data = await fs.promises.readFile(filePath, 'utf8');

          const lines = data.split('\n');

          lines.forEach((line, index) => {
            searchPatterns.forEach(pattern => {
              if (line.includes(pattern)) {
                const result: Report = {
                  file: file,
                  line: index + 1,
                  pattern: pattern,
                };

                report.push(result);
                const groupedReport = Object.values(
                  report.reduce((acc: any, item: any) => {
                    if (!acc[item.file]) {
                      acc[item.file] = {
                        file: item.file,
                        line: [],
                        pattern: item.pattern,
                      };
                    }
                    acc[item.file].line.push(item.line);
                    return acc;
                  }, {})
                );
                groupedReport.forEach((item: any) => {
                  item.line = item.line.join(', ');
                });

                report.length = 0;
                report.push(...groupedReport);
              }
            });
          });
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
