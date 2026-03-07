import { PermissionData } from '@/types/global';
import { PermissionStatus } from '@/types/enums';
import { findProjectPbxproj } from '../utils/iosFiles';
import path from 'path';

const hasDebugFlagInRelease = (pbxproj: string): boolean => {
  const releaseBlocks = pbxproj.match(
    /\/\* Release \*\/ = \{[\s\S]*?buildSettings = \{[\s\S]*?\};[\s\S]*?\};/g
  );
  if (!releaseBlocks) return false;
  return releaseBlocks.some(block =>
    /DEBUG=1|SWIFT_ACTIVE_COMPILATION_CONDITIONS\s*=\s*.*DEBUG/.test(block)
  );
};

const iosReleaseDebugFlagsAnalyze = async (
  currentPath: string
): Promise<PermissionData | null> => {
  const pbxproj = await findProjectPbxproj(currentPath);
  if (!pbxproj) {
    return {
      numLine: null,
      status: PermissionStatus.NOT_FOUND,
      permission: 'iOS Release Debug Flags',
      severity: 'W',
      message: 'No se encontró project.pbxproj para validar flags de Release.',
      owaspCategory: 'M8',
      nameFile: 'project.pbxproj',
    };
  }

  const hasDebug = hasDebugFlagInRelease(pbxproj.content);
  return {
    numLine: null,
    status: hasDebug ? PermissionStatus.WARNING : PermissionStatus.OK,
    permission: 'iOS Release Debug Flags',
    severity: 'W',
    message: hasDebug
      ? 'Se encontraron flags de DEBUG en configuración Release.'
      : 'No se detectaron flags de DEBUG en Release.',
    owaspCategory: 'M8',
    nameFile: path.basename(pbxproj.filePath),
  };
};

export default iosReleaseDebugFlagsAnalyze;

