import fs from 'fs';
import path from 'path';
import { findIosSourceFiles } from '../utils/iosFiles';

export interface TrustKitConfigData {
  filePath: string;
  fileName: string;
  fileContent: string;
  hostname: string | null;
  hashes: string[];
}

const TRUST_KIT_INIT_REGEX = /TrustKit\.initSharedInstance\s*\(\s*withConfiguration:/;
const PINNED_DOMAINS_REGEX = /kTSKPinnedDomains\s*:\s*\[[\s\S]*?\]\s*\]/;
const FIRST_DOMAIN_REGEX = /"([^"]+)"\s*:\s*\[/;
const HASHES_BLOCK_REGEX = /kTSKPublicKeyHashes\s*:\s*\[([\s\S]*?)\]/;

export const normalizePublicKeyHash = (hash: string): string =>
  hash.replace(/^sha256\//, '').trim();

export const hasTrustKitConfig = (fileContent: string): boolean =>
  TRUST_KIT_INIT_REGEX.test(fileContent) || PINNED_DOMAINS_REGEX.test(fileContent);

export const extractTrustKitHostname = (fileContent: string): string | null => {
  const pinnedDomains = PINNED_DOMAINS_REGEX.exec(fileContent);
  if (!pinnedDomains) return null;
  const hostnameMatch = FIRST_DOMAIN_REGEX.exec(pinnedDomains[0]);
  return hostnameMatch?.[1] ?? null;
};

export const extractTrustKitHashes = (fileContent: string): string[] => {
  const hashesBlock = HASHES_BLOCK_REGEX.exec(fileContent);
  if (!hashesBlock) return [];

  const hashes = [...hashesBlock[1].matchAll(/"([^"]+)"/g)].map(match =>
    normalizePublicKeyHash(match[1])
  );
  return hashes;
};

export const findTrustKitConfigFile = async (
  currentPath: string
): Promise<TrustKitConfigData | null> => {
  const sourceFiles = await findIosSourceFiles(currentPath);
  for (const sourceFilePath of sourceFiles) {
    let fileContent = '';
    try {
      fileContent = await fs.promises.readFile(sourceFilePath, 'utf8');
    } catch {
      continue;
    }

    if (!hasTrustKitConfig(fileContent)) continue;
    return {
      filePath: sourceFilePath,
      fileName: path.basename(sourceFilePath),
      fileContent,
      hostname: extractTrustKitHostname(fileContent),
      hashes: extractTrustKitHashes(fileContent),
    };
  }

  return null;
};

export const replaceTrustKitHashes = (
  fileContent: string,
  hashes: string[]
): string | null => {
  const hashesBlock = /kTSKPublicKeyHashes\s*:\s*\[[\s\S]*?\]/.exec(fileContent);
  if (!hashesBlock || typeof hashesBlock.index !== 'number') return null;

  const lineStart = fileContent.lastIndexOf('\n', hashesBlock.index) + 1;
  const line = fileContent.slice(
    lineStart,
    fileContent.indexOf('\n', lineStart) === -1
      ? undefined
      : fileContent.indexOf('\n', lineStart)
  );
  const indentation = /^(\s*)/.exec(line)?.[1] ?? '';
  const hashIndentation = `${indentation}  `;

  const replacement = `kTSKPublicKeyHashes : [\n${hashes
    .map(hash => `${hashIndentation}"${normalizePublicKeyHash(hash)}"`)
    .join(',\n')}\n${indentation}]`;

  return `${fileContent.slice(0, hashesBlock.index)}${replacement}${fileContent.slice(
    hashesBlock.index + hashesBlock[0].length
  )}`;
};

