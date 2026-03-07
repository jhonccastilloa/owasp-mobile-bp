import { AutomationReportSummary, AutomationRuleResult } from '@/types/audit';

const percentage = (num: number, den: number) =>
  den === 0 ? 0 : Math.round((num / den) * 10000) / 100;

export const getAutomationSummary = (
  results: AutomationRuleResult[]
): AutomationReportSummary => {
  const summary: AutomationReportSummary = {
    totalRules: results.length,
    fixed: 0,
    alreadyCompliant: 0,
    skipped: 0,
    failed: 0,
    fixSuccessRate: 0,
    residualHigh: 0,
    residualMedium: 0,
    residualLow: 0,
  };

  for (const result of results) {
    if (result.status === 'FIXED') summary.fixed += 1;
    else if (result.status === 'ALREADY_COMPLIANT') summary.alreadyCompliant += 1;
    else if (result.status === 'SKIPPED') summary.skipped += 1;
    else if (result.status === 'FAILED') summary.failed += 1;

    if (result.status === 'SKIPPED' || result.status === 'FAILED') {
      if (result.risk === 'high') summary.residualHigh += 1;
      else if (result.risk === 'medium') summary.residualMedium += 1;
      else summary.residualLow += 1;
    }
  }

  summary.fixSuccessRate = percentage(
    summary.fixed,
    summary.fixed + summary.skipped + summary.failed
  );

  return summary;
};
