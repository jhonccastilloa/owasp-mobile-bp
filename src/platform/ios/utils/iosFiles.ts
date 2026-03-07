import fs from 'fs';
import path from 'path';
import getOwaspBpConfig from '@/utils/owasp-bp.config';

const shouldSkipDirectory = (name: string) =>
  ['Pods', 'build', '.git', '.idea', '.gradle', 'node_modules'].includes(name);

const PRODUCTION_INFO_PLIST_REGEX = /(production|produccion|prod)/i;
const GOOGLE_SERVICE_INFO_PLIST = 'GoogleService-Info.plist';

const walkFiles = async (
  rootPath: string,
  onFile: (filePath: string) => boolean | Promise<boolean>
): Promise<void> => {
  const stack = [rootPath];
  while (stack.length > 0) {
    const currentPath = stack.pop();
    if (!currentPath) continue;
    let entries: fs.Dirent[];
    try {
      entries = await fs.promises.readdir(currentPath, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        if (!shouldSkipDirectory(entry.name)) stack.push(fullPath);
        continue;
      }
      const shouldStop = await onFile(fullPath);
      if (shouldStop) return;
    }
  }
};

export const getIosRoot = (projectPath: string) => path.join(projectPath, 'ios');

export type IosInfoPlistResolveReason =
  | 'NO_PLIST_FOUND'
  | 'OVERRIDE_NOT_FOUND'
  | 'NO_PRODUCTION_MATCH'
  | 'AMBIGUOUS_PRODUCTION_MATCH';

type IosInfoPlistResolveStrategy =
  | 'override'
  | 'single-candidate'
  | 'production-name-match';

export type IosInfoPlistResolution =
  | {
      ok: true;
      filePath: string;
      content: string;
      strategy: IosInfoPlistResolveStrategy;
    }
  | {
      ok: false;
      reason: IosInfoPlistResolveReason;
      message: string;
      candidates: string[];
    };

const toPosixRelativePath = (projectPath: string, filePath: string) =>
  path.relative(projectPath, filePath).split(path.sep).join('/');

const isInfoPlistCandidate = (filePath: string) => {
  const baseName = path.basename(filePath);
  if (!/info.*\.plist$/i.test(baseName)) return false;
  if (baseName.toLowerCase() === GOOGLE_SERVICE_INFO_PLIST.toLowerCase()) return false;
  if (filePath.includes(`${path.sep}Tests${path.sep}`)) return false;
  return true;
};

const getInfoPlistCandidates = async (projectPath: string): Promise<string[]> => {
  const iosRoot = getIosRoot(projectPath);
  const candidates: string[] = [];
  await walkFiles(iosRoot, async filePath => {
    if (isInfoPlistCandidate(filePath)) {
      candidates.push(filePath);
    }
    return false;
  });
  return [...new Set(candidates)].sort((a, b) => a.localeCompare(b));
};

const buildInfoPlistFailure = (
  reason: IosInfoPlistResolveReason,
  message: string,
  candidates: string[]
): IosInfoPlistResolution => ({
  ok: false,
  reason,
  message,
  candidates,
});

const readInfoPlist = async (
  filePath: string,
  strategy: IosInfoPlistResolveStrategy
): Promise<IosInfoPlistResolution> => {
  try {
    const content = await fs.promises.readFile(filePath, 'utf8');
    return {
      ok: true,
      filePath,
      content,
      strategy,
    };
  } catch {
    return buildInfoPlistFailure(
      'NO_PLIST_FOUND',
      `No se pudo leer Info.plist en '${filePath}'.`,
      [filePath]
    );
  }
};

export const formatInfoPlistResolutionError = (
  resolution: Extract<IosInfoPlistResolution, { ok: false }>
): string => {
  const candidateText = resolution.candidates.length
    ? `Candidatos: ${resolution.candidates.join(', ')}.`
    : 'No se encontraron candidatos Info.plist.';
  return `No se pudo resolver Info.plist de producción (${resolution.reason}). ${resolution.message} ${candidateText} Define 'iosInfoPlistPath' en owasp-bp.config.json para seleccionar el archivo correcto.`;
};

export const resolveProductionInfoPlist = async (
  projectPath: string
): Promise<IosInfoPlistResolution> => {
  const config = await getOwaspBpConfig(projectPath, true);
  const override = config?.iosInfoPlistPath?.trim();
  if (override) {
    const resolvedOverride = path.isAbsolute(override)
      ? override
      : path.join(projectPath, override);
    if (!isInfoPlistCandidate(resolvedOverride)) {
      return buildInfoPlistFailure(
        'OVERRIDE_NOT_FOUND',
        `El override 'iosInfoPlistPath' apunta a un archivo inválido: '${override}'.`,
        [override]
      );
    }

    try {
      await fs.promises.access(resolvedOverride, fs.constants.F_OK);
    } catch {
      return buildInfoPlistFailure(
        'OVERRIDE_NOT_FOUND',
        `No existe el archivo configurado en 'iosInfoPlistPath': '${override}'.`,
        [override]
      );
    }
    return readInfoPlist(resolvedOverride, 'override');
  }

  const candidates = await getInfoPlistCandidates(projectPath);
  const relativeCandidates = candidates.map(candidate =>
    toPosixRelativePath(projectPath, candidate)
  );

  if (candidates.length === 0) {
    return buildInfoPlistFailure(
      'NO_PLIST_FOUND',
      'No se encontró ningún Info.plist válido bajo la carpeta ios/.',
      []
    );
  }

  if (candidates.length === 1) {
    return readInfoPlist(candidates[0], 'single-candidate');
  }

  const productionCandidates = candidates.filter(candidate =>
    PRODUCTION_INFO_PLIST_REGEX.test(path.basename(candidate))
  );

  if (productionCandidates.length === 1) {
    return readInfoPlist(productionCandidates[0], 'production-name-match');
  }

  if (productionCandidates.length === 0) {
    return buildInfoPlistFailure(
      'NO_PRODUCTION_MATCH',
      "Se encontraron múltiples Info.plist pero ninguno coincide con patrón de producción ('Production|Produccion|Prod').",
      relativeCandidates
    );
  }

  return buildInfoPlistFailure(
    'AMBIGUOUS_PRODUCTION_MATCH',
    'Se encontraron múltiples Info.plist que coinciden como producción.',
    productionCandidates.map(candidate => toPosixRelativePath(projectPath, candidate))
  );
};

export const findPrimaryInfoPlist = async (
  projectPath: string
): Promise<{ filePath: string; content: string } | null> => {
  const resolution = await resolveProductionInfoPlist(projectPath);
  if (!resolution.ok) return null;
  return {
    filePath: resolution.filePath,
    content: resolution.content,
  };
};

export const findProjectPbxproj = async (
  projectPath: string
): Promise<{ filePath: string; content: string } | null> => {
  const iosRoot = getIosRoot(projectPath);
  let found: { filePath: string; content: string } | null = null;
  await walkFiles(iosRoot, async filePath => {
    if (!filePath.endsWith('project.pbxproj')) return false;
    try {
      const content = await fs.promises.readFile(filePath, 'utf8');
      found = { filePath, content };
      return true;
    } catch {
      return false;
    }
  });
  return found;
};

export const findIosSourceFiles = async (projectPath: string): Promise<string[]> => {
  const iosRoot = getIosRoot(projectPath);
  const files: string[] = [];
  await walkFiles(iosRoot, async filePath => {
    if (/\.(swift|m|mm)$/.test(filePath)) {
      files.push(filePath);
    }
    return false;
  });
  return files;
};
