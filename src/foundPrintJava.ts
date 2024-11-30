import fs from "fs";
import path from "path";

const searchPatterns = [
  "System.out.printf",
  "System.out.println",
  "System.err.println",
];

interface Report {
  file: string;
  line: number;
  pattern: string;
}
const searchInFiles = async (directory: string, report: any[]) => {
  try {
    // Lee el directorio usando fs.promises.readdir
    const files = await fs.promises.readdir(directory);

    const filePromises = files.map(async (file) => {
      const filePath = path.join(directory, file);

      // Si es un directorio, se llama recursivamente
      if (fs.lstatSync(filePath).isDirectory()) {
        await searchInFiles(filePath, report); // Recursión para subdirectorios
      } else if (file.endsWith(".java")) {
        // Lee el archivo usando fs.promises.readFile
        try {
          const data = await fs.promises.readFile(filePath, "utf8");

          // Procesa las líneas del archivo
          const lines = data.split("\n");
          lines.forEach((line, index) => {
            searchPatterns.forEach((pattern) => {
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
                report.push(result)
                // // Agrupar por archivo y consolidar las líneas
                const groupedReport = Object.values(
                  report.reduce((acc: any, item: any) => {
                    console.log("acc-->", acc)
                    console.log("item-->", item)

                    if (!acc[item.file]) {
                      acc[item.file] = { file: item.file, line: [], pattern: item.pattern };
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
                console.log("groupedReport2---->", report);

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


const foundPrintJava = async (directory: string): Promise<any[]> => {
  const report: Report[] = [];
  // console.log("foundPrintJava----> REPORT", report)

  try {
    await searchInFiles(path.join(directory, 'android'), report);
    console.log("searchInFiles--------> REPORT", report)


  } catch (err) {
    console.error("Error durante la búsqueda", err);
  }

  return report
}

export default foundPrintJava