import { AutomationRunReport } from '@/types/audit';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

const statusColor = (status: string) =>
  ({
    FIXED: '#2e7d32',
    ALREADY_COMPLIANT: '#0277bd',
    FAILED: '#c62828',
    SKIPPED: '#ef6c00',
  })[status] ?? '#37474f';

const riskColor = (risk: string) =>
  ({
    high: '#c62828',
    medium: '#ef6c00',
    low: '#2e7d32',
  })[risk] ?? '#37474f';

const shortText = (value: string, max = 72) =>
  value.length > max ? `${value.slice(0, max - 3)}...` : value;

const pdfAutomationTemplate = (
  report: AutomationRunReport
): TDocumentDefinitions => {
  const summaryCards = {
    table: {
      widths: ['20%', '20%', '20%', '20%', '20%'],
      body: [
        [
          {
            text: [{ text: 'Total\n', style: 'metricTitle' }, `${report.summary.totalRules}`],
            style: 'metricCard',
            fillColor: '#eceff1',
          },
          {
            text: [{ text: 'Fixed\n', style: 'metricTitle' }, `${report.summary.fixed}`],
            style: 'metricCard',
            color: '#2e7d32',
            fillColor: '#e8f5e9',
          },
          {
            text: [
              { text: 'Compliant\n', style: 'metricTitle' },
              `${report.summary.alreadyCompliant}`,
            ],
            style: 'metricCard',
            color: '#0277bd',
            fillColor: '#e1f5fe',
          },
          {
            text: [{ text: 'Skipped\n', style: 'metricTitle' }, `${report.summary.skipped}`],
            style: 'metricCard',
            color: '#ef6c00',
            fillColor: '#fff3e0',
          },
          {
            text: [{ text: 'Failed\n', style: 'metricTitle' }, `${report.summary.failed}`],
            style: 'metricCard',
            color: '#c62828',
            fillColor: '#ffebee',
          },
        ],
      ],
    },
    layout: 'noBorders' as const,
    margin: [0, 0, 0, 10] as [number, number, number, number],
  };

  const ruleSummaryTable = {
    table: {
      headerRows: 1,
      widths: ['27%', '10%', '15%', '10%', '8%', '30%'],
      body: [
        [
          { text: 'Rule', style: 'tableHeader' },
          { text: 'Platform', style: 'tableHeader' },
          { text: 'Status', style: 'tableHeader' },
          { text: 'Risk', style: 'tableHeader' },
          { text: 'Files', style: 'tableHeader' },
          { text: 'Notes', style: 'tableHeader' },
        ],
        ...report.results.map(result => [
          { text: result.ruleId, style: 'tableCell' },
          { text: result.platform.toUpperCase(), style: 'tableCell' },
          {
            text: result.status,
            style: 'tableCellBold',
            color: statusColor(result.status),
          },
          {
            text: result.risk.toUpperCase(),
            style: 'tableCellBold',
            color: riskColor(result.risk),
          },
          { text: `${result.filesChanged.length}`, style: 'tableCell', alignment: 'center' },
          {
            text: shortText(
              result.reasonMessage ??
                result.manualAction ??
                'No additional notes.'
            ),
            style: 'tableCell',
          },
        ]),
      ],
    },
    layout: {
      hLineColor: () => '#d7dde2',
      vLineColor: () => '#d7dde2',
      fillColor: (rowIndex: number) => (rowIndex === 0 ? '#eceff1' : null),
    },
    margin: [0, 0, 0, 14] as [number, number, number, number],
  };

  const detailBlocks: any[] = report.results.map(result => {
    const evidenceTable = result.beforeAfter.length
      ? {
          table: {
            headerRows: 1,
            widths: ['26%', '37%', '37%'],
            body: [
              [
                { text: 'Evidence File', style: 'tableHeader' },
                { text: 'Before', style: 'tableHeader' },
                { text: 'After', style: 'tableHeader' },
              ],
              ...result.beforeAfter.map(item => [
                { text: shortText(item.file, 38), style: 'tableCell' },
                { text: shortText(item.before, 70), style: 'tableCell' },
                { text: shortText(item.after, 70), style: 'tableCell' },
              ]),
            ],
          },
          layout: {
            hLineColor: () => '#e1e5ea',
            vLineColor: () => '#e1e5ea',
            fillColor: (rowIndex: number) => (rowIndex === 0 ? '#f5f7f9' : null),
          },
          margin: [0, 6, 0, 0] as [number, number, number, number],
        }
      : { text: 'No evidence available.', style: 'smallMuted', margin: [0, 4, 0, 0] as [number, number, number, number] };

    return {
      stack: [
        {
          columns: [
            {
              width: '*',
              text: result.ruleId,
              style: 'ruleHeader',
            },
            {
              width: 'auto',
              text: result.status,
              bold: true,
              color: '#ffffff',
              fillColor: statusColor(result.status),
              margin: [6, 2, 6, 2] as [number, number, number, number],
            },
          ],
        },
        {
          columns: [
            {
              width: '35%',
              text: [{ text: 'Platform: ', bold: true }, result.platform.toUpperCase()],
            },
            {
              width: '25%',
              text: [
                { text: 'Risk: ', bold: true },
                { text: result.risk.toUpperCase(), color: riskColor(result.risk), bold: true },
              ],
            },
            {
              width: '40%',
              text: [{ text: 'Duration: ', bold: true }, `${result.durationMs} ms`],
              alignment: 'right',
            },
          ],
          margin: [0, 3, 0, 0] as [number, number, number, number],
        },
        {
          text: [
            { text: 'Files changed: ', bold: true },
            result.filesChanged.length ? result.filesChanged.join(', ') : 'None',
          ],
          margin: [0, 3, 0, 0] as [number, number, number, number],
        },
        result.reasonCode
          ? {
              text: [
                { text: 'Reason: ', bold: true },
                `${result.reasonCode}${
                  result.reasonMessage ? ` - ${result.reasonMessage}` : ''
                }`,
              ],
              margin: [0, 3, 0, 0] as [number, number, number, number],
            }
          : { text: '' },
        result.manualAction
          ? {
              text: [{ text: 'Manual action: ', bold: true }, result.manualAction],
              margin: [0, 3, 0, 0] as [number, number, number, number],
            }
          : { text: '' },
        evidenceTable,
      ],
      margin: [0, 0, 0, 12] as [number, number, number, number],
      unbreakable: false,
    };
  });

  return {
    content: [
      {
        text: 'OWASP Mobile BP',
        style: 'title',
      },
      {
        text: 'Automation Report',
        style: 'subTitle',
        margin: [0, 0, 0, 8] as [number, number, number, number],
      },
      {
        table: {
          widths: ['20%', '80%'],
          body: [
            [{ text: 'Application', style: 'metaKey' }, { text: report.appName, style: 'metaVal' }],
            [{ text: 'Branch', style: 'metaKey' }, { text: report.currentBranch, style: 'metaVal' }],
            [{ text: 'Generated', style: 'metaKey' }, { text: report.generatedAt, style: 'metaVal' }],
            [{ text: 'Command', style: 'metaKey' }, { text: report.command, style: 'metaVal' }],
          ],
        },
        layout: {
          hLineColor: () => '#d7dde2',
          vLineColor: () => '#d7dde2',
          fillColor: (rowIndex: number) => (rowIndex % 2 === 0 ? '#fafbfc' : null),
        },
        margin: [0, 0, 0, 12] as [number, number, number, number],
      },
      {
        text: `Fix Success Rate: ${report.summary.fixSuccessRate}%`,
        style: 'sectionTitle',
        margin: [0, 0, 0, 6] as [number, number, number, number],
      },
      {
        text: `Residual Risk: High ${report.summary.residualHigh} | Medium ${report.summary.residualMedium} | Low ${report.summary.residualLow}`,
        style: 'smallMuted',
        margin: [0, 0, 0, 10] as [number, number, number, number],
      },
      summaryCards,
      {
        text: 'Rules Overview',
        style: 'sectionTitle',
        margin: [0, 0, 0, 6] as [number, number, number, number],
      },
      ruleSummaryTable,
      {
        text: 'Rule Details',
        style: 'sectionTitle',
        margin: [0, 2, 0, 8] as [number, number, number, number],
      },
      ...detailBlocks,
    ],
    defaultStyle: {
      font: 'Roboto',
      fontSize: 9,
    },
    styles: {
      title: { fontSize: 18, bold: true, color: '#102a43' },
      subTitle: { fontSize: 13, bold: true, color: '#334e68' },
      sectionTitle: { fontSize: 12, bold: true, color: '#1f2933' },
      metaKey: { bold: true, color: '#486581', fontSize: 9 },
      metaVal: { color: '#102a43', fontSize: 9 },
      metricCard: { alignment: 'center', bold: true, fontSize: 14, margin: [0, 8, 0, 8] },
      metricTitle: { color: '#52606d', fontSize: 8 },
      tableHeader: { bold: true, fontSize: 8, color: '#243b53' },
      tableCell: { fontSize: 8, color: '#102a43' },
      tableCellBold: { fontSize: 8, bold: true },
      ruleHeader: { fontSize: 10, bold: true, color: '#102a43' },
      smallMuted: { color: '#7b8794', fontSize: 8 },
    },
    pageMargins: [32, 40, 32, 40],
    footer: (currentPage: number, pageCount: number) => ({
      text: `Page ${currentPage} of ${pageCount}`,
      alignment: 'center',
      margin: [0, 6, 0, 0],
      fontSize: 8,
      color: '#7b8794',
    }),
  };
};

export default pdfAutomationTemplate;
