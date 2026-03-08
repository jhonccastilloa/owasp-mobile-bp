import path from 'path';
import { PermissionStatus } from '../types/enums';
import { OwaspSeverity } from '../types/global';
import fs from 'fs';

const cleanAndReplace = (data: string, regex: RegExp) => {
  let match: RegExpExecArray | null;
  let newData = data;
  const comments: string[] = [];
  while ((match = regex.exec(data)) !== null) {
    const commentSplit = match[0].split('\n');
    newData = newData.replace(
      match[0],
      match[0]
        .split('\n')
        .map((_, i) => `<!--COMMENT_${comments.length + i}-->`)
        .join('\n')
    );
    comments.push(...commentSplit);
  }
  return { newData, comments };
};

export const cleanXmlComments = (data: string) => {
  const regexComments = /<!--([\s\S]*?)-->/g;
  return cleanAndReplace(data, regexComments);
};

// Backward-compatible alias; use cleanXmlComments in new code.
export const cleanXmlComentaries = cleanXmlComments;

export const cleanBlockAndLineComment = (data: string) => {
  const regexComments = /(?<!https?:)\/\/.*?$|\/\*[\s\S]*?\*\//gm;
  return cleanAndReplace(data, regexComments);
};

export const recuperateComments = (data: string, comments: string[]) => {
  return data.replace(/<!--COMMENT_(\d+)-->/g, (_, index) => comments[index]);
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
  nameFile: string,
  maxDepth: number = 10,
  currentDepth: number = 0
): Promise<[string | null, string | null]> => {
  if (currentDepth >= maxDepth) {
    return [null, null];
  }

  try {
    try {
      await fs.promises.access(currentPath, fs.constants.F_OK);
    } catch {
      return [null, null];
    }

    const files = await fs.promises.readdir(currentPath);

    for (const file of files) {
      const filePath = path.resolve(currentPath, file);

      let stats;
      try {
        stats = await fs.promises.lstat(filePath);
      } catch {
        continue;
      }

      if (stats.isDirectory()) {
        const result = await searchFile(filePath, nameFile, maxDepth, currentDepth + 1);
        if (result[0] && result[1]) return result;
      } else if (file === nameFile) {
        return [await fs.promises.readFile(filePath, 'utf8'), filePath];
      }
    }

    return [null, null];
  } catch {
    return [null, null];
  }
};
