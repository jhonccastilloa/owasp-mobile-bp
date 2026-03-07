import { PermissionData } from '@/types/global';
import { PermissionStatus } from '@/types/enums';
import verifyTabjackingInMainActivity from './verifyTabjacking';
import { getMainActivityJava } from '@/utils/androidFiles';
import path from 'path';

const tabjackingAnalyze = async (currentPath: string) => {
  const { mainActivityFile, mainActivityPath } = await getMainActivityJava(currentPath);
  const { message, status } = await verifyTabjackingInMainActivity(
    mainActivityFile,
    mainActivityPath
  );

  const data: PermissionData = {
    numLine: null,
    status: status ? PermissionStatus.OK : PermissionStatus.NOT_FOUND,
    permission: 'Prevencion contra Tapjacking',
    severity: 'E',
    message,
    owaspCategory: 'M7',
    nameFile: mainActivityPath ? path.basename(mainActivityPath) : 'MainActivity',
  };
  return data;
};

export default tabjackingAnalyze;
