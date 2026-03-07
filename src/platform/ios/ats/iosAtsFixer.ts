import fs from 'fs';
import {
  formatInfoPlistResolutionError,
  resolveProductionInfoPlist,
} from '../utils/iosFiles';
import { logger } from '@/utils/logger';

const iosAtsFix = async (currentPath: string) => {
  const infoPlist = await resolveProductionInfoPlist(currentPath);
  if (!infoPlist.ok) {
    logger.warn(
      `Skipping iOS ATS fixer: ${formatInfoPlistResolutionError(infoPlist)}`
    );
    return;
  }

  if (!/<key>NSAllowsArbitraryLoads<\/key>\s*<true\/>/.test(infoPlist.content)) {
    return;
  }

  const fixedContent = infoPlist.content.replace(
    /<key>NSAllowsArbitraryLoads<\/key>\s*<true\/>/g,
    '<key>NSAllowsArbitraryLoads</key>\n\t<false/>'
  );
  await fs.promises.writeFile(infoPlist.filePath, fixedContent, 'utf8');
  logger.success('iOS ATS fixer applied successfully');
};

export default iosAtsFix;
