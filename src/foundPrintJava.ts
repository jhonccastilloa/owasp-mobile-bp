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
    // Lee el directorio usando fs.promises.readdir
    const files = await fs.promises.readdir(directory);

    const filePromises = files.map(async file => {
      const filePath = path.join(directory, file);

      // Si es un directorio, se llama recursivamente
      if (fs.lstatSync(filePath).isDirectory()) {
        await searchInFiles(filePath, report); // Recursión para subdirectorios
      } else if (file.endsWith('.java')) {
        // Lee el archivo usando fs.promises.readFile
        try {
          const data = await fs.promises.readFile(filePath, 'utf8');

          // Procesa las líneas del archivo
          const lines = data.split('\n');

          lines.forEach((line, index) => {
            searchPatterns.forEach(pattern => {
              if (line.includes(pattern)) {
                const result: Report = {
                  file: file,
                  line: index + 1,
                  pattern: pattern,
                };
                // console.log("REPORT----------->", report)
                // console.log(
                //   `Se encontró '${pattern}' en ${filePath}, línea ${index + 1}`
                // );
                report.push(result);
                // // Agrupar por archivo y consolidar las líneas
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
                // console.log("groupedReport---->", groupedReport)

                // Transformar líneas en una cadena separada por comas
                groupedReport.forEach((item: any) => {
                  item.line = item.line.join(', ');
                });

                report.length = 0; // Limpia el arreglo original
                report.push(...groupedReport);
              }
            });
          });
        } catch (err) {
          console.error(`Error leyendo el archivo: ${filePath}`, err);
        }
      }
    });
    // Espera que todas las promesas de archivos se resuelvan
    await Promise.all(filePromises);
  } catch (err) {
    console.error(`Error leyendo el directorio: ${directory}`, err);
  }
};

const foundPrintJava = async (directory: string): Promise<any> => {
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
