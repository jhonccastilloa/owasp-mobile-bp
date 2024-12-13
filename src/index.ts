#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import PdfPrinter from 'pdfmake';
import foundPrintJava from './foundPrintJava';
import verifyUserPermissions from './userPermissions';
import checkPermissionsGeneral from './checkPermissionsGeneral';
import { createPdfDefinition } from './pdfDesign';
import { execSync } from 'child_process';
import {
  PdfData,
  PdfDataPer,
  PdfDataPermission,
  PermissionData,
  TransformPdfData,
} from './types/global';
import { PermissionStatus } from './types/enums';
import verifyBuildGradle from './verifyBuildGradle';
import verifyNetworkSecurityConfig from './verifyNetworkSecurityConfig';
import { OWASP } from './data';
import { evaluateStatus, getPercentage, transformPercentage } from './utils/tool';

const fonts = {
  Roboto: {
    normal: path.resolve(__dirname, 'assets/fonts/Roboto/Roboto-Regular.ttf'),
    bold: path.resolve(__dirname, 'assets/fonts/Roboto/Roboto-Medium.ttf'),
    italics: path.resolve(__dirname, '..assets/Roboto/Roboto-Italic.ttf'),
  },
};

const printer = new PdfPrinter(fonts);

const generatePDF = async (contentArray: any) => {
  const docDefinition = createPdfDefinition(contentArray);

  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  const outputPath = path.join(process.cwd(), 'output4.pdf');
  pdfDoc.pipe(fs.createWriteStream(outputPath));
  pdfDoc.end();
  console.log(`PDF generado: ${outputPath}`);
};

const transformPdfdata = (data: PermissionData[]): TransformPdfData => {
  const groupedPermissions = data.reduce((obj: PdfDataPermission, item) => {
    if (!obj[item.owaspCategory]) {
      obj[item.owaspCategory] = {
        title: OWASP[item.owaspCategory].title,
        percentageJustified: 0,
        percentageJustifiedLabel: '',
        permissions: [],
      };
    }
    obj[item.owaspCategory].permissions.push(item);
    return obj;
  }, {});

  let sumPercentage = 0;

  const groupedPermissionsWithPercentage = Object.entries(
    groupedPermissions
  ).map(([permission, object]) => {
    const contJustifyPermission = object.permissions.filter(
      ({ status }) => PermissionStatus.OK === status
    ).length;
    const percentageJustified = getPercentage(
      contJustifyPermission,
      object.permissions.length
    );
    sumPercentage += percentageJustified;
    const newPermission: PdfDataPer = {
      ...object,
      percentageJustified,
      percentageJustifiedLabel: `${transformPercentage(percentageJustified) * 100}%`,
    };
    return [permission, newPermission] as const;
  });

  const totalPercentage = getPercentage(
    sumPercentage,
    groupedPermissionsWithPercentage.length
  );
  groupedPermissionsWithPercentage.sort((a, b) => {
    const numA = parseInt(a[0].replace('M', ''), 10);
    const numB = parseInt(b[0].replace('M', ''), 10);
    return numA - numB;
  });

  return {
    status: evaluateStatus(totalPercentage * 100).category,
    percentage: totalPercentage,
    percentageLabel: `${transformPercentage(totalPercentage) * 100}%`,
    owasp: Object.fromEntries(groupedPermissionsWithPercentage),
  };
};

const main = async () => {
  const args = process.argv.slice(2);

  switch (args[0]) {
    case 'verify':
      const currentPath = process.cwd();

      const userPermissions = await verifyUserPermissions(currentPath);
      const generalPermissions = await checkPermissionsGeneral(currentPath);

      const buildGradle = await verifyBuildGradle(currentPath);

      const networkSecurity = await verifyNetworkSecurityConfig(currentPath);

      let printJava = await foundPrintJava(currentPath);

      const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', {
        encoding: 'utf-8',
      }).trim();
      const appJson = JSON.parse(
        fs.readFileSync(path.join(currentPath, 'app.json'), 'utf-8')
      );

      const owaspTransformData = transformPdfdata([
        ...userPermissions,
        ...generalPermissions,
        ...buildGradle,
        ...networkSecurity,
        printJava,
      ]);
      const today = new Date();
      const data: PdfData = {
        appName: appJson.displayName,
        currentBranch,
        date: new Intl.DateTimeFormat('es-ES').format(today),
        ...owaspTransformData,
      };
      // console.log(JSON.stringify(data, null, 3));
      generatePDF(data);
      console.log('========================================');
      console.log('REPORTE GENERADO EXITOSAMENTE');
      console.log('========================================');

      break;

    default:
      console.log(
        "Comando no reconocido. Usa 'swasp verify' para verificar el proyecto."
      );
      break;
  }
};

main();
