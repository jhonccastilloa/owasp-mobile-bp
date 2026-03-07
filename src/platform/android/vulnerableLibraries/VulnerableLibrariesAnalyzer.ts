import { PermissionData, DependencyReport } from '@/types/global';
import { PermissionStatus } from '@/types/enums';
import { LIBRARIES_WITH_VULNERABILITIES } from '@/rules/libraryVulnerabilityRules';
import { getPackageDependencies } from '@/utils/packageJson';
import { isVersionInRange } from '@/utils/version';
import { AuditOptions } from '@/types/audit';

const vulnerableLibrariesAnalyze = async (
  currentPath: string,
  options?: Pick<AuditOptions, 'includeDevDependencies'>
) => {
  const report: DependencyReport[] = [];

  const packageDependencies = await getPackageDependencies(
    currentPath,
    options?.includeDevDependencies
  );

  for (const library of LIBRARIES_WITH_VULNERABILITIES) {
    const version = packageDependencies[library.package];
    if (
      version &&
      isVersionInRange(version, library.minVersion, library.maxVersion)
    ) {
      report.push({
        library: library.package,
        version,
        description: library.description,
        vulnId: library.vulnId,
        severity: library.severity,
        owaspCategory: library.owaspCategory,
        url: library.url,
      });
    }
  }

  const data: PermissionData = {
    numLine: null,
    status: report.length === 0 ? PermissionStatus.OK : PermissionStatus.ERROR,
    permission: 'Librerias Vulnerables',
    severity: 'E',
    message:
      report.length === 0
        ? 'No se detectaron vulnerabilidades en las dependencias.'
        : `Se detectaron ${report.length} libreria(s) potencialmente vulnerables.`,
    owaspCategory: 'M8',
    libraryReports: report,
  };
  return data;
};

export default vulnerableLibrariesAnalyze;
