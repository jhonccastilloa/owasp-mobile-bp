#!/usr/bin/env node
import fs from 'fs';
import path, { dirname } from 'path';
import PdfPrinter from 'pdfmake';
import foundPrintJava from './foundPrintJava';
import verifyPermissions from './checkPermissions';
import checkPermissionsGeneral from './checkPermissionsGeneral';
import { createPdfDefinition } from './pdfDesign';
// import RobotoRegular from '../assets/fonts'

const fonts = {
  Roboto: {
    normal: path.resolve(__dirname, 'assets/fonts/Roboto/Roboto-Regular.ttf'),
    bold: path.resolve(__dirname, 'assets/fonts/Roboto/Roboto-Medium.ttf')
    // italics: '..assets/Roboto/Roboto-Italic.ttf',
    // bolditalics: '..assets/Roboto/Roboto-MediumItalic.ttf',
  },
};

const printer = new PdfPrinter(fonts);

const generatePDF = async (contentArray: any) => {
  const docDefinition = createPdfDefinition(contentArray)


  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  const outputPath = path.join(process.cwd(), 'output4.pdf');
  pdfDoc.pipe(fs.createWriteStream(outputPath));
  pdfDoc.end();
  console.log(`PDF generado: ${outputPath}`);
};

const main = async () => {
  const args = process.argv.slice(2);
  const messages = []; // Array para acumular los mensajes

  switch (args[0]) {
    case 'verify':
      const currentPath = process.cwd();
      let logsJava = await foundPrintJava(currentPath);
      let M1General = await checkPermissionsGeneral(currentPath);
      console.log("M1 GENERLA", M1General)
      generatePDF(logsJava);
      // await verifyPermissions(currentPath);
      // console.log('-------------------------');

      break;

    default:
      console.log("Comando no reconocido. Usa 'swasp verify' para verificar el proyecto.");
      break;
  }


}

main();
