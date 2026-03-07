import fs from 'fs';
import path from 'path';
import { Finding } from '@/types/audit';

interface JsonReportPayload {
  appName: string;
  generatedAt: string;
  findings: Finding[];
}

export const writeJsonReport = async (
  projectPath: string,
  payload: JsonReportPayload
): Promise<string> => {
  const reportPath = path.join(projectPath, 'owasp-bp-report.json');
  await fs.promises.writeFile(reportPath, JSON.stringify(payload, null, 2), 'utf8');
  return reportPath;
};

