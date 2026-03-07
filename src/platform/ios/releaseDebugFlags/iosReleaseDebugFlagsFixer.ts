import fs from 'fs';
import { findProjectPbxproj } from '../utils/iosFiles';
import { logger } from '@/utils/logger';

const fixReleaseBlock = (block: string): string => {
  let updated = block.replace(/DEBUG=1/g, '');
  updated = updated.replace(
    /(SWIFT_ACTIVE_COMPILATION_CONDITIONS\s*=\s*[^;]*?)DEBUG\s*/g,
    (_match, prefix: string) => prefix
  );
  updated = updated.replace(/\s{2,}/g, ' ');
  return updated;
};

const iosReleaseDebugFlagsFix = async (currentPath: string) => {
  const pbxproj = await findProjectPbxproj(currentPath);
  if (!pbxproj) {
    logger.warn('project.pbxproj not found, skipping iOS release flags fixer');
    return;
  }

  const releaseRegex =
    /\/\* Release \*\/ = \{[\s\S]*?buildSettings = \{[\s\S]*?\};[\s\S]*?\};/g;
  const fixed = pbxproj.content.replace(releaseRegex, block => fixReleaseBlock(block));
  if (fixed === pbxproj.content) return;
  await fs.promises.writeFile(pbxproj.filePath, fixed, 'utf8');
  logger.success('iOS release debug flags fixer applied successfully');
};

export default iosReleaseDebugFlagsFix;

