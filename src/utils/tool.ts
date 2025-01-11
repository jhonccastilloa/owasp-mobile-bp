import { PermissionStatus } from '../types/enums';
import { OwaspSeverity } from '../types/global';

export const cleanComentaries = (data: string) => {
  let match: RegExpExecArray | null;
  const regex = /<!--([\s\S]*?)-->/g;

  while ((match = regex.exec(data)) !== null) {
    data = data.replace(
      match[0],
      match[0]
        .split('\n')
        .map((_, i) => i)
        .join('\n')
    );
  }

  return data;
};

export const validateSeverity = (
  severity: OwaspSeverity,
  status: boolean,
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

export const getPercentage = (x: number, y: number) => transformPercentage(x / y);

export const transformPercentage = (value: number) => Math.floor(value * 100) / 100;

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
