import fs from 'fs';
import path from 'path';
import foundPrintJava from './foundPrintJava';
import verifyUserPermissions from './userPermissions';
import checkPermissionsGeneral from './checkPermissionsGeneral';
import { execSync } from 'child_process';
import { PdfData } from './types/global';
import verifyBuildGradle from './verifyBuildGradle';
import verifyNetworkSecurityConfig from './verifyNetworkSecurityConfig';
import foundVulnerableLibraries from './foundVulnerableLibraries';

import { generatePDF, transformPdfdata } from './pdfMake';
import { verifyTapjacking } from './verifyTapjacking';

const main = async () => {
  const args = process.argv.slice(2);

  switch (args[0]) {
    case 'verify':
      const currentPath = process.cwd();

      const tapjackingResult = await verifyTapjacking(currentPath);
      const userPermissions = await verifyUserPermissions(currentPath);
      const generalPermissions = await checkPermissionsGeneral(currentPath);
      const buildGradle = await verifyBuildGradle(currentPath);
      const networkSecurity = await verifyNetworkSecurityConfig(currentPath);
      const printJava = await foundPrintJava(currentPath);
      const vulnerableLibraries = await foundVulnerableLibraries(currentPath);

      const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', {
        encoding: 'utf-8',
      }).trim();

      const appJson = JSON.parse(
        fs.readFileSync(path.join(currentPath, 'app.json'), 'utf-8')
      );

      const arrData = [
        ...userPermissions,
        ...generalPermissions,
        ...buildGradle,
        ...networkSecurity,
      ];
      if (printJava) {
        arrData.push(printJava);
      }
      if (vulnerableLibraries) {
        arrData.push(vulnerableLibraries);
      }
      if (tapjackingResult) {
        arrData.push(tapjackingResult);
      }
      const owaspTransformData = transformPdfdata(arrData);
      const today = new Date();
      const data: PdfData = {
        appName: appJson.displayName,
        currentBranch,
        date: new Intl.DateTimeFormat('es-ES').format(today),
        ...owaspTransformData,
      };
      generatePDF(data);

      break;

    default:
      console.log(
        "Comando no reconocido. Usa 'swasp verify' para verificar el proyecto."
      );
      break;
  }
};

main();
