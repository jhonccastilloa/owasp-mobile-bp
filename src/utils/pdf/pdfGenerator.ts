import { PdfData } from '@/types/global';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import pdfOwaspTemplate from './pdfOwaspTemplate';
import pdfMake from 'pdfmake/build/pdfmake';
import path from 'path';
import fs from 'fs';
(<any>pdfMake).addVirtualFileSystem(pdfFonts);
export const generatePDF = async (
  contentArray: PdfData,
  currentPath: string
) => {
  // pdfMake.fonts = {
  //   Roboto: {
  //     normal: 'Roboto-Regular.ttf',
  //     bold: 'Roboto-Medium.ttf',
  //     italics: 'Roboto-Italic.ttf',
  //     bolditalics: 'Roboto-Italic.ttf',
  //   },
  //   Courier: {
  //     normal: 'Courier',
  //     bold: 'Courier-Bold',
  //     italics: 'Courier-Oblique',
  //     bolditalics: 'Courier-BoldOblique',
  //   },
  //   Helvetica: {
  //     normal: 'Helvetica',
  //     bold: 'Helvetica-Bold',
  //     italics: 'Helvetica-Oblique',
  //     bolditalics: 'Helvetica-BoldOblique',
  //   },
  //   Times: {
  //     normal: 'Times-Roman',
  //     bold: 'Times-Bold',
  //     italics: 'Times-Italic',
  //     bolditalics: 'Times-BoldItalic',
  //   },
  //   Symbol: {
  //     normal: 'Symbol',
  //   },
  //   ZapfDingbats: {
  //     normal: 'ZapfDingbats',
  //   },
  // };
  const docDefinition = pdfOwaspTemplate(contentArray);
  const pdfDocGenerator = pdfMake.createPdf(docDefinition);

  pdfDocGenerator.getBase64(data => {
    const buffer = Buffer.from(data, 'base64');
    const outputPath = path.join(currentPath, 'owasp-bp.pdf');
    fs.writeFile(outputPath, buffer, err => {
      if (err) {
        console.error('Error al guardar el archivo PDF:', err);
      } else {
        console.log('Archivo PDF guardado en:', outputPath);
      }
    });
  });
};
