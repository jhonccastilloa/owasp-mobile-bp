import { AuditCliOptions, AuditOptions } from '@/types/audit';
import getOwaspBpConfig from './owasp-bp.config';

const DEFAULT_AUDIT_OPTIONS: Omit<AuditOptions, 'projectPath'> = {
  platform: 'all',
  reportFormat: 'both',
  includeDevDependencies: false,
};

export const resolveAuditOptions = async (
  projectPath: string,
  cliOptions: AuditCliOptions = {}
): Promise<AuditOptions> => {
  const config = await getOwaspBpConfig(projectPath, true);
  return {
    projectPath,
    platform:
      cliOptions.platform ??
      config?.platforms ??
      DEFAULT_AUDIT_OPTIONS.platform,
    reportFormat:
      cliOptions.reportFormat ??
      config?.reportFormat ??
      DEFAULT_AUDIT_OPTIONS.reportFormat,
    includeDevDependencies:
      cliOptions.includeDevDependencies ??
      config?.includeDevDependencies ??
      DEFAULT_AUDIT_OPTIONS.includeDevDependencies,
  };
};
