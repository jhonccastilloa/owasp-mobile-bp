import fs from 'fs';
import path from 'path';
import { PermissionData, DependencyReport } from './types/global';
import { PermissionStatus } from './types/enums';

import { LIBRARIES_WITH_VULNERABILITIES } from './data/libraryVulnerabilityReport';

type Dependencies = Record<string, string>;

const getDependencies = async (packageFilePath: string): Promise<Dependencies> => {
  const data = await fs.promises.readFile(packageFilePath, 'utf-8');
  const jsonData = JSON.parse(data);
  const dependencies = jsonData.dependencies;
   return dependencies
};

function isVersionInRange(
  version: string,
  minVersion: string | number,
  maxVersion: string | number
): boolean {
  const cleanVersion = version.replace("^", "");
  return (
    cleanVersion >= String(minVersion) && cleanVersion <= String(maxVersion)
  );
}

const foundVulnerableLibraries = async (directory: string) => {
  const report: DependencyReport[] = [];

    const packageFilePath = path.join(directory, 'package.json');
      const dependencies = await getDependencies(packageFilePath);

      for (const library of LIBRARIES_WITH_VULNERABILITIES) {
        const version = dependencies[library.package];
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
        permission: "Librerias Vulnerables",
        severity: "E",
        message:
          "No se detectaron vulnerabilidades en las dependencias.",
        owaspCategory: "M8",
        libraryReports: report,
      };
      return data;
};

export default foundVulnerableLibraries;