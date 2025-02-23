import { PdfData, PermissionData } from '@/types/global';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

const pdfOwaspTemplate = (json: PdfData): TDocumentDefinitions => {
  const owaspBlocks = Object.keys(json.owasp).reduce(
    (acc: any, category: string) => {
      acc.push({
        text: [
          {
            text: `${category}: ${json.owasp[category].title} (${json.owasp[category].percentageJustifiedLabel})`,
          },
        ],
        style: 'header',
        margin: [0, 10, 0, 10],
      });

      json.owasp[category].permissions.forEach((permission: PermissionData) => {
        let statusColor = '#fd7e14';
        if (permission.status === 'OK') {
          statusColor = '#28a745';
        } else if (permission.status === 'ERROR') {
          statusColor = '#dc3545';
        } else if (permission.status === 'DUPLICATE') {
          statusColor = '#6f42c1';
        } else if (permission.status === 'NOT FOUND') {
          statusColor = '#6c757d';
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
                style: 'italicStyle',
              },
            ],
            margin: [10, 5, 0, 5],
          }));
        } else if (
          permission.permission === 'Librerias Vulnerables' &&
          permission.libraryReports
        ) {
          extraContent = permission.libraryReports.map(extra => ({
            text: [
              { text: 'Librería: ', bold: true },
              { text: `${extra.library}\n` },
              { text: 'Versión: ', bold: true },
              { text: `${extra.version}\n`, style: 'italicStyle' },
              { text: 'Descripción: ', bold: true },
              { text: `${extra.description}\n`, style: 'italicStyle' },
            ],
            margin: [10, 5, 0, 5],
          }));
        } else {
          extraContent = [
            {
              text: `Archivo: ${
                permission.nameFile || 'No especificado'
              } - línea: ${permission.numLine || 'No especificado'}`,
              style: 'italicStyle',
            },
          ];
        }

        acc.push({
          stack: [
            {
              text: [
                {
                  text: `${permission.status} |`,
                  color: statusColor,
                  bold: true,
                },
                {
                  text: [
                    {
                      text: ` ${permission.permission}`,
                      color: 'black',
                      bold: true,
                    },
                    {
                      text: ` - ${permission.message || 'Sin descripción.'}`,
                      color: 'black',
                    },
                  ],
                },
              ],

              margin: [0, 5, 0, 5],
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
          widths: ['99%'],
          body: [
            [
              {
                text: 'OWASP Top Ten Mobile',
                style: 'title',
                alignment: 'center',
                padding: [10, 10, 10, 10],
              },
            ],
          ],
        },
        layout: {
          hLineWidth: (i, node) => (i === 0 ? 1.5 : 0),
          vLineWidth: (i, node) => {
            return 1.5;
          },
          hLineColor: () => '#020204',
          vLineColor: () => '#020204',
        },
        margin: [0, 0, 0, 0],
      },

      {
        table: {
          widths: ['33%', '33%', '33%'],
          body: [
            [
              {
                stack: [
                  { text: 'Application Name:', style: 'subtitle' },
                  { text: json.appName },
                  { text: 'Status:', style: 'subtitle', margin: [0, 10, 0, 0] },
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
                  { text: 'Date:', style: 'subtitle' },
                  { text: json.date },
                  {
                    text: 'Quality Level:',
                    style: 'subtitle',
                    margin: [0, 10, 0, 0],
                  },
                  { text: json.status == 'Rejected' ? 'Not Passed' : 'Passed' },
                ],
              },
            ],
          ],
        },
        layout: {
          hLineWidth: (i: any, node: any) =>
            i === 0 || i === node.table.body.length ? 1.5 : 0,
          vLineWidth: (i: any, node: any) =>
            i === 0 || i === node.table.widths.length ? 1.5 : 0,
          hLineColor: () => '#020204',
          vLineColor: () => '#020204',
          paddingLeft: () => 20,
          paddingRight: () => 10,
          paddingTop: () => 10,
          paddingBottom: () => 10,
          marginTop: () => 20,
        },
        margin: [0, 0, 0, 0],
      },
      ...owaspBlocks,
    ],
    defaultStyle: {
      font: 'Roboto',
      fontSize: 12,
    },
    styles: {
      italicStyle: {
        italics: true,
      },
      header: {
        fontSize: 14,
        bold: true,
        alignment: 'center',
        color: '#242426',
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
      title: {
        fontSize: 14,
        bold: true,
        margin: [5, 5, 5, 5],
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

export default pdfOwaspTemplate;
