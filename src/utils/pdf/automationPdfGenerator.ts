import fs from 'fs';
import path from 'path';
import { logger } from '../logger';
import { AutomationRunReport } from '@/types/audit';
import pdfAutomationTemplate from './pdfAutomationTemplate';

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

export const generateAutomationPDF = async (
  report: AutomationRunReport,
  currentPath: string
): Promise<string> => {
  logger.info('Generating automation PDF report...');

  const pdfmake = await initializePdfMake();
  const docDefinition = pdfAutomationTemplate(report);
  const pdfDoc = pdfmake.createPdf(docDefinition);
  const outputPath = path.join(currentPath, 'owasp-bp-automate.pdf');

  await new Promise<void>((resolve, reject) => {
    pdfDoc.getBase64((data: string) => {
      const buffer = Buffer.from(data, 'base64');
      fs.writeFile(outputPath, buffer, err => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  logger.success(`Automation PDF report saved: ${outputPath}`);
  return outputPath;
};

