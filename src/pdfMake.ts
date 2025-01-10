import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import path from 'path';
import fs from 'fs';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { PdfData, PdfDataPer, PdfDataPermission, PermissionData, TransformPdfData } from './types/global';
import { OWASP } from './data';
import { evaluateStatus, getPercentage, transformPercentage } from './utils/tool';
import { PermissionStatus } from './types/enums';

(<any>pdfMake).addVirtualFileSystem(pdfFonts);

export interface ExtraData {
  file: string;
  line: string;
  pattern: string;
}

const createPdfDefinition = (json: PdfData): TDocumentDefinitions => {
  const owaspBlocks = Object.keys(json.owasp).reduce(
    (acc: any, category: string) => {
      acc.push({
        text: [
          {
            text: `${category}: ${json.owasp[category].title} (${json.owasp[category].percentageJustifiedLabel})`,
          },
        ],
        style: 'header',
        margin: [0, 10, 0, 5],
      });

      json.owasp[category].permissions.forEach((permission: PermissionData) => {
        let statusColor = 'orange';
        if (permission.status === 'OK') {
          statusColor = 'green';
        } else if (permission.status === 'ERROR') {
          statusColor = 'red';
        }

        let extraContent = [];
        if (
          permission.permission === 'Logs en archivos Java' &&
          permission.extraData
        ) {
          extraContent = permission.extraData.map(extra => ({
            text: [
              { text: `Archivo: ${extra.file}\n`, bold: true },
              {
                text: `Líneas: ${extra.line}\n`,
                style: 'italics',
              },
            ],
            margin: [10, 5, 0, 5],
          }));
        } else {
          extraContent = [
            {
              text: `Archivo: ${
                permission.nameFile || 'No especificado'
              } - línea: ${permission.numLine || 'No especificado'}`,
              style: 'italics',
            },
          ];
        }

        acc.push({
          stack: [
            {
              text: [
                { text: `${permission.status}`, color: statusColor },
                {
                  text: ` ${permission.permission} - ${
                    permission.message || 'Sin descripción.'
                  }`,
                  color: 'black',
                },
              ],
              margin: [0, 0, 0, 5],
            },
            ...extraContent,
          ],
          margin: [10, 0, 0, 5],
        });
      });

      return acc;
    },
    []
  );

  return {
    content: [
      {
        table: {
          widths: ['33%', '33%', '33%'],
          body: [
            [
              {
                stack: [
                  { text: 'Nombre de la aplicación:', style: 'subtitle' },
                  { text: json.appName },
                  { text: 'Estado:', style: 'subtitle', margin: [0, 10, 0, 0] },
                  { text: json.percentageLabel },
                ],
              },
              {
                stack: [
                  { text: 'Branch:', style: 'subtitle' },
                  { text: json.currentBranch },
                  // { text: 'Líneas:', style: 'subtitle', margin: [0, 10, 0, 0] },
                  // { text: '1000' },
                ],
              },
              {
                stack: [
                  { text: 'Fecha:', style: 'subtitle' },
                  { text: json.date },
                  {
                    text: 'Umbral de Calidad:',
                    style: 'subtitle',
                    margin: [0, 10, 0, 0],
                  },
                  { text: json.status ? 'OK' : 'ERROR' },
                ],
              },
            ],
          ],
        },
        layout: {
          hLineWidth: (i: any, node: any) =>
            i === 0 || i === node.table.body.length ? 1 : 0,
          vLineWidth: (i: any, node: any) =>
            i === 0 || i === node.table.widths.length ? 1 : 0,
          hLineColor: () => '#008000',
          vLineColor: () => '#008000',
          paddingLeft: () => 15,
          paddingRight: () => 15,
          paddingTop: () => 15,
          paddingBottom: () => 15,
        },
        margin: [0, 0, 0, 10],
      },
      ...owaspBlocks,
    ],
    defaultStyle: {
      fontSize: 12,
    },
    styles: {
      header: {
        fontSize: 14,
        bold: true,
        alignment: 'center',
      },
      tableHeader: {
        bold: true,
        fontSize: 12,
        color: 'black',
      },
      subheader: {
        fontSize: 12,
        margin: [0, 5],
      },
      sectionHeader: {
        fontSize: 16,
        bold: true,
        margin: [0, 10],
      },
      cardTitle: {
        fontSize: 14,
        bold: true,
        margin: [5, 5, 5, 5],
      },
      cardPercent: {
        fontSize: 12,
        bold: true,
        color: 'green',
        margin: [5, 5, 5, 5],
      },
      cardDescription: {
        fontSize: 10,
        margin: [5, 5, 5, 5],
      },
      subtitle: {
        bold: true,
        color: '#5A5A5A',
      },
    },
    pageMargins: [40, 60, 40, 60],
    footer: (currentPage: number, pageCount: number) => {
      return {
        text: `Página ${currentPage} de ${pageCount}`,
        alignment: 'center',
        margin: [0, 10, 0, 0],
      };
    },
  };
};

export const generatePDF = async (contentArray: PdfData) => {
  // pdfMake.fonts = {
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
  const docDefinition = createPdfDefinition(contentArray);
  const pdfDocGenerator = pdfMake.createPdf(docDefinition);

  pdfDocGenerator.getBase64(data => {
    const buffer = Buffer.from(data, 'base64');
    const outputPath = path.join(process.cwd(), 'owasp-bp.pdf');
    fs.writeFile(outputPath, buffer, err => {
      if (err) {
        console.error('Error al guardar el archivo PDF:', err);
      } else {
        console.log('Archivo PDF guardado en:', outputPath);
      }
    });
  });
};

export const transformPdfdata = (data: PermissionData[]): TransformPdfData => {
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
      percentageJustifiedLabel: `${Math.trunc(
        transformPercentage(percentageJustified) * 100
      )}%`,
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
    percentageLabel: `${Math.trunc(
      transformPercentage(totalPercentage) * 100
    )}%`,
    owasp: Object.fromEntries(groupedPermissionsWithPercentage),
  };
};
