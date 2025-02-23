import { PermissionData, DependencyReport } from '@/types/global';
import { PermissionStatus } from '@/types/enums';
import { LIBRARIES_WITH_VULNERABILITIES } from '@/rules/libraryVulnerabilityRules';
import { getPackageDependencies } from '@/utils/packageJson';

function isVersionInRange(
  version: string,
  minVersion: string | number,
  maxVersion: string | number
): boolean {
  const cleanVersion = version.replace('^', '');
  return (
    cleanVersion >= String(minVersion) && cleanVersion <= String(maxVersion)
  );
}

const vulnerableLibrariesAnalyze = async (currentPath: string) => {
  const report: DependencyReport[] = [];

  const packageDependencies = await getPackageDependencies(currentPath);

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
    message: 'No se detectaron vulnerabilidades en las dependencias.',
    owaspCategory: 'M8',
    libraryReports: report,
  };
  return data;
};

export default vulnerableLibrariesAnalyze;
