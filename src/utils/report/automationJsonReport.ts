import fs from 'fs';
import path from 'path';
import { AutomationRunReport } from '@/types/audit';

export const writeAutomationJsonReport = async (
  projectPath: string,
  payload: AutomationRunReport
): Promise<string> => {
  const reportPath = path.join(projectPath, 'owasp-bp-automate.json');
  await fs.promises.writeFile(reportPath, JSON.stringify(payload, null, 2), 'utf8');
  return reportPath;
};

