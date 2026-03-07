import { PdfData } from '@/types/global';
import pdfOwaspTemplate from './pdfOwaspTemplate';
import path from 'path';
import fs from 'fs';
import { logger } from '../logger';

type PdfMakeLike = {
  createPdf: (docDefinition: unknown) => {
    getBase64: (callback: (data: string) => void) => void;
  };
  addVirtualFileSystem?: (vfs: unknown) => void;
  vfs?: unknown;
};

let pdfmakeInstance: PdfMakeLike | null = null;

const initializePdfMake = async () => {
  if (!pdfmakeInstance) {
    const pdfmakeModule = await import('pdfmake/build/pdfmake.js');
    const pdfFontsModule = await import('pdfmake/build/vfs_fonts.js');

    const pdfmake = pdfmakeModule.default as PdfMakeLike;
    const fonts = pdfFontsModule.default as {
      vfs?: unknown;
      pdfMake?: { vfs?: unknown };
    };

    if (typeof pdfmake.addVirtualFileSystem === 'function') {
      pdfmake.addVirtualFileSystem(fonts);
    } else {
      pdfmake.vfs = fonts.pdfMake?.vfs ?? fonts.vfs;
    }

    pdfmakeInstance = pdfmake;
  }
  return pdfmakeInstance;
};

export const generatePDF = async (
  contentArray: PdfData,
  currentPath: string
): Promise<void> => {
  logger.info('Generating PDF report...');

  try {
    const pdfmake = await initializePdfMake();

    const docDefinition = pdfOwaspTemplate(contentArray);
    const pdfDoc = pdfmake.createPdf(docDefinition);

    await new Promise<void>((resolve, reject) => {
      pdfDoc.getBase64((data: string) => {
        const buffer = Buffer.from(data, 'base64');
        const outputPath = path.join(currentPath, 'owasp-bp.pdf');
        fs.writeFile(outputPath, buffer, err => {
          if (err) {
            logger.error(`Failed to save PDF: ${err.message}`);
            reject(err);
          } else {
            logger.success(`PDF report saved: ${outputPath}`);
            resolve();
          }
        });
      });
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`PDF generation failed: ${message}`);
    throw error;
  }
};
