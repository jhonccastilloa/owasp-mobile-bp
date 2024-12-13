import { PdfData, PermissionData } from './types/global';

export interface ExtraData {
  file: string;
  line: string;
  pattern: string;
}

export const createPdfDefinition = (json: PdfData) => {
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
                font: 'Roboto',
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
              font: 'Roboto',
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
      // font: 'Roboto',
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
