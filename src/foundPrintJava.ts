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
const searchInFiles = async (directory: string, report: Report[]) => {
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
                  file: filePath,
                  line: index + 1,
                  pattern: pattern,
                };
                report.push(result);
                console.log(
                  `Se encontró '${pattern}' en ${filePath}, línea ${index + 1}`
                );
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


const foundPrintJava = async (directory: string): Promise<void> => {
  const report: Report[] = [];
  try {
    await searchInFiles(path.join(directory, 'android'), report);
  } catch (err) {
    console.error("Error durante la búsqueda", err);
  }
}

export default foundPrintJava