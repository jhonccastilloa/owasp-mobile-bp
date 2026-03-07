const normalizeVersion = (version: string): number[] => {
  const cleaned = version.replace(/^[~^<>=\s]*/, '').split('-')[0];
  return cleaned
    .split('.')
    .map(part => Number.parseInt(part, 10))
    .map(value => (Number.isNaN(value) ? 0 : value));
};

export const compareVersions = (left: string, right: string): number => {
  const a = normalizeVersion(left);
  const b = normalizeVersion(right);
  const size = Math.max(a.length, b.length);

  for (let i = 0; i < size; i += 1) {
    const valueA = a[i] ?? 0;
    const valueB = b[i] ?? 0;

    if (valueA > valueB) return 1;
    if (valueA < valueB) return -1;
  }

  return 0;
};

export const isVersionInRange = (
  version: string,
  minVersion: string | number,
  maxVersion: string | number
): boolean =>
  compareVersions(version, String(minVersion)) >= 0 &&
  compareVersions(version, String(maxVersion)) <= 0;

export const isVersionGreaterOrEqual = (
  version: string,
  threshold: string
): boolean => compareVersions(version, threshold) >= 0;

