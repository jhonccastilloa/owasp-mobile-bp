import fs from 'fs';
import path from 'path';
import { linesUpToMatch, searchFile } from '@/utils/tool';

interface ManifestPermissionEntry {
  permission: string;
  numLine: number;
  nameFile: string;
  remove: boolean;
}

interface ManifestAttribute {
  value: string;
  numLine: number;
  nameFile: string;
}

export interface AndroidVariantContext {
  variant: string;
  mainManifestPath: string;
  mainManifestContent: string;
  variantManifestPath: string | null;
  variantManifestContent: string | null;
}

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getSourceSetsRoot = (projectPath: string) =>
  path.join(projectPath, 'android', 'app', 'src');

const getManifestPath = (projectPath: string, sourceSet: string) =>
  path.join(getSourceSetsRoot(projectPath), sourceSet, 'AndroidManifest.xml');

const readFileIfExists = async (filePath: string): Promise<string | null> => {
  try {
    return await fs.promises.readFile(filePath, 'utf8');
  } catch {
    return null;
  }
};

export const resolveAndroidVariants = async (
  _projectPath: string
): Promise<string[]> => {
  return ['main'];
};

export const loadAndroidVariantContext = async (
  projectPath: string
): Promise<AndroidVariantContext> => {
  const mainManifestPath = getManifestPath(projectPath, 'main');
  const mainManifestContent = (await readFileIfExists(mainManifestPath)) ?? '';
  const variantManifestPath = null;
  const variantManifestContent = null;

  return {
    variant: 'main',
    mainManifestPath,
    mainManifestContent,
    variantManifestPath,
    variantManifestContent,
  };
};

const extractPermissions = (
  manifestData: string,
  fileName: string
): ManifestPermissionEntry[] => {
  const permissions: ManifestPermissionEntry[] = [];
  const regex = /<uses-permission\b([^>]*?)\/?>/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(manifestData)) !== null) {
    const attrs = match[1];
    const permissionRegex = /android:name\s*=\s*"([^"]+)"/;
    const removeRegex = /tools:node\s*=\s*"remove"/;
    const permissionMatch = permissionRegex.exec(attrs);
    if (!permissionMatch) continue;
    permissions.push({
      permission: permissionMatch[1].replace('android.permission.', ''),
      numLine: linesUpToMatch(manifestData, match.index),
      nameFile: fileName,
      remove: removeRegex.test(attrs),
    });
  }
  return permissions;
};

export const getMergedManifestPermissions = (
  context: AndroidVariantContext
): Array<Omit<ManifestPermissionEntry, 'remove'>> => {
  const merged = new Map<string, Omit<ManifestPermissionEntry, 'remove'>>();
  const mainPermissions = extractPermissions(
    context.mainManifestContent,
    path.basename(context.mainManifestPath)
  );
  for (const permission of mainPermissions) {
    if (!permission.remove) {
      merged.set(permission.permission, {
        permission: permission.permission,
        numLine: permission.numLine,
        nameFile: permission.nameFile,
      });
    }
  }

  if (context.variantManifestContent) {
    const variantPermissions = extractPermissions(
      context.variantManifestContent,
      path.basename(context.variantManifestPath ?? '')
    );
    for (const permission of variantPermissions) {
      if (permission.remove) {
        merged.delete(permission.permission);
        continue;
      }
      merged.set(permission.permission, {
        permission: permission.permission,
        numLine: permission.numLine,
        nameFile: permission.nameFile,
      });
    }
  }

  return [...merged.values()];
};

const getAttributeFromTag = (
  manifestData: string,
  tagRegex: RegExp,
  key: string,
  fileName: string
): ManifestAttribute | null => {
  const tagMatch = tagRegex.exec(manifestData);
  if (!tagMatch) return null;

  const tagContent = tagMatch[0];
  const attrRegex = new RegExp(`${escapeRegExp(key)}\\s*=\\s*"([^"]+)"`);
  const attrMatch = attrRegex.exec(tagContent);
  if (!attrMatch || typeof attrMatch.index !== 'number') return null;

  return {
    value: attrMatch[1],
    numLine: linesUpToMatch(manifestData, tagMatch.index + attrMatch.index),
    nameFile: fileName,
  };
};

const getManifestAttribute = (
  manifestData: string,
  key: string,
  fileName: string
) => getAttributeFromTag(manifestData, /<manifest\b[^>]*>/, key, fileName);

const getApplicationAttribute = (
  manifestData: string,
  key: string,
  fileName: string
) => getAttributeFromTag(manifestData, /<application\b[^>]*>/, key, fileName);

const getMainActivityAttribute = (
  manifestData: string,
  key: string,
  fileName: string
) =>
  getAttributeFromTag(
    manifestData,
    /<activity\b[^>]*android:name\s*=\s*"[^"]*MainActivity[^"]*"[^>]*>/,
    key,
    fileName
  );

export const getMergedManifestAttribute = (
  context: AndroidVariantContext,
  key: string
): ManifestAttribute | null => {
  if (context.variantManifestContent) {
    const fromVariant = getManifestAttribute(
      context.variantManifestContent,
      key,
      path.basename(context.variantManifestPath ?? '')
    );
    if (fromVariant) return fromVariant;
  }

  return getManifestAttribute(
    context.mainManifestContent,
    key,
    path.basename(context.mainManifestPath)
  );
};

export const getMergedApplicationAttribute = (
  context: AndroidVariantContext,
  key: string
): ManifestAttribute | null => {
  if (context.variantManifestContent) {
    const fromVariant = getApplicationAttribute(
      context.variantManifestContent,
      key,
      path.basename(context.variantManifestPath ?? '')
    );
    if (fromVariant) return fromVariant;
  }

  return getApplicationAttribute(
    context.mainManifestContent,
    key,
    path.basename(context.mainManifestPath)
  );
};

export const getMergedMainActivityAttribute = (
  context: AndroidVariantContext,
  key: string
): ManifestAttribute | null => {
  if (context.variantManifestContent) {
    const fromVariant = getMainActivityAttribute(
      context.variantManifestContent,
      key,
      path.basename(context.variantManifestPath ?? '')
    );
    if (fromVariant) return fromVariant;
  }

  return getMainActivityAttribute(
    context.mainManifestContent,
    key,
    path.basename(context.mainManifestPath)
  );
};

export const getNetworkSecurityConfigForVariant = async (
  projectPath: string,
  context: AndroidVariantContext
): Promise<[string | null, string | null]> => {
  const applicationAttr = getMergedApplicationAttribute(
    context,
    'android:networkSecurityConfig'
  );
  if (!applicationAttr) return [null, null];

  const match = /^@xml\/([a-zA-Z0-9_.-]+)$/.exec(applicationAttr.value);
  if (!match) return [null, null];

  const fileName = `${match[1]}.xml`;
  const sourceSetPriority = [context.variant, 'main'].filter(
    (item, index, arr) => arr.indexOf(item) === index
  );
  for (const sourceSet of sourceSetPriority) {
    const filePath = path.join(
      getSourceSetsRoot(projectPath),
      sourceSet,
      'res',
      'xml',
      fileName
    );
    const content = await readFileIfExists(filePath);
    if (content) return [content, filePath];
  }

  return searchFile(path.join(projectPath, 'android', 'app', 'src'), fileName);
};
