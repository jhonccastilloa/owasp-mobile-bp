import { PermissionData } from '@/types/global';
import { PermissionStatus } from '@/types/enums';
import verifyTabjackingInMainActivity from './verifyTabjacking';
import { getMainActivityJava } from '@/utils/androidFiles';

const tabjackingAnalyze = async (currentPath: string) => {
  const { mainActivityFile } = await getMainActivityJava(currentPath);
  const { message, status } = await verifyTabjackingInMainActivity(
    mainActivityFile
  );

  const data: PermissionData = {
    numLine: null,
    status: status ? PermissionStatus.OK : PermissionStatus.NOT_FOUND,
    permission: 'Prevencion contra Tapjacking',
    severity: 'E',
    message,
    owaspCategory: 'M7',
    nameFile: 'MainActivity.java',
  };
  return data;
};

export default tabjackingAnalyze;
