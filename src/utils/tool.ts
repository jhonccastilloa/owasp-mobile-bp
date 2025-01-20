import path from 'path';
import { PermissionStatus } from '../types/enums';
import { OwaspSeverity } from '../types/global';
import fs from 'fs';

const cleanAndReplace = (data: string, regex: RegExp) => {
  let match: RegExpExecArray | null;
  let newData = data;
  while ((match = regex.exec(data)) !== null) {
    newData = newData.replace(
      match[0],
      match[0]
        .split('\n')
        .map(() => '')
        .join('\n')
    );
  }
  return newData;
};

export const cleanXmlComentaries = (data: string) => {
  const regexComments = /<!--([\s\S]*?)-->/g;
  return cleanAndReplace(data, regexComments);
};

export const cleanJavaComments = (data: string) => {
  const regexComments = /(?<!https?:)\/\/.*?$|\/\*[\s\S]*?\*\//gm;
  return cleanAndReplace(data, regexComments);
};

export const validateSeverity = (
  severity: OwaspSeverity,
  status: boolean
): PermissionStatus => {
  switch (severity) {
    case 'E':
      return status ? PermissionStatus.OK : PermissionStatus.ERROR;
    case 'W':
      return status ? PermissionStatus.OK : PermissionStatus.WARNING;
    default:
      return PermissionStatus.NOT_FOUND;
  }
};

export const linesUpToMatch = (data: string, matchPosition: number) =>
  data.substring(0, matchPosition).split('\n').length;

export const getPercentage = (x: number, y: number) =>
  transformPercentage(x / y);

export const transformPercentage = (value: number) =>
  Math.floor(value * 100) / 100;

export const evaluateStatus = (percentage: number) => {
  if (typeof percentage !== 'number' || percentage < 0 || percentage > 100) {
    return {
      category: 'Invalid',
    };
  }
  if (percentage >= 90) {
    return {
      category: 'Excellent',
    };
  } else if (percentage >= 80) {
    return {
      category: 'Passed',
    };
  } else if (percentage >= 70) {
    return {
      category: 'Fair',
    };
  } else if (percentage >= 50) {
    return {
      category: 'Poor',
    };
  } else {
    return {
      category: 'Rejected',
    };
  }
};

export const searchFile = async (
  currentPath: string,
  nameFile: string
): Promise<null | string> => {
  try {
    if (!fs.existsSync(currentPath)) {
      return null;
    }

    const files = await fs.promises.readdir(currentPath);

    for (const file of files) {
      const filePath = path.resolve(currentPath, file);

      let stats;
      try {
        stats = await fs.promises.lstat(filePath);
      } catch (err) {
        console.error(`⚠️ No se pudo leer: ${filePath}`);
        continue;
      }

      if (stats.isDirectory()) {
        const result = await searchFile(filePath, nameFile);
        if (result) return result;
      } else if (file === nameFile) {
        return await fs.promises.readFile(filePath, 'utf8');
      }
    }

    return null;
  } catch (error) {
    return null;
  }
};
