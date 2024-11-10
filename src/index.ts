#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

function findAndroidDir(startPath: string): string | null {
  const files = fs.readdirSync(startPath);
  for (const file of files) {
    const fullPath = path.join(startPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file === 'android') {
        return fullPath;
      }
      const found = findAndroidDir(fullPath);
      if (found) return found;
    }
  }
  return null;
}

function searchForPrintf(directory: string): void {
  const files = fs.readdirSync(directory);
  files.forEach(file => {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      searchForPrintf(fullPath);
    } else if (file.endsWith('.java')) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      if (content.includes('System.out.printf')) {
        console.log(`Encontrado 'System.out.printf' en: ${fullPath}`);
      }
    }
  });
}

function main() {
  const args = process.argv.slice(2);

  if (args[0] === 'verify') {
    const currentPath = process.cwd();
    const androidDir = findAndroidDir(currentPath);
    if (androidDir) {
      console.log(`Directorio 'android' encontrado en: ${androidDir}`);
      searchForPrintf(androidDir);
    } else {
      console.log("No se encontró el directorio 'android' en el proyecto actual.");
    }
  } else {
    console.log("Comando no reconocido. Usa 'swasp verify' para verificar el proyecto.");
  }
}

main();
