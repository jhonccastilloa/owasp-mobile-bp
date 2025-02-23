import { OWASP_CATEGORY } from '@/constants/owaspCategories';
import {
  PdfDataPer,
  PdfDataPermission,
  PermissionData,
  TransformPdfData,
} from '@/types/global';
import { evaluateStatus, getPercentage, transformPercentage } from '../tool';
import { PermissionStatus } from '@/types/enums';

const transformDataForPdf = (data: PermissionData[]): TransformPdfData => {
  const groupedPermissions = data.reduce((obj: PdfDataPermission, item) => {
    if (!obj[item.owaspCategory]) {
      obj[item.owaspCategory] = {
        title: OWASP_CATEGORY[item.owaspCategory].title,
        percentageJustified: 0,
        percentageJustifiedLabel: '',
        permissions: [],
      };
    }
    obj[item.owaspCategory].permissions.push(item);
    return obj;
  }, {});

  let sumPercentage = 0;

  const groupedPermissionsWithPercentage = Object.entries(
    groupedPermissions
  ).map(([permission, object]) => {
    const contJustifyPermission = object.permissions.filter(
      ({ status }) => PermissionStatus.OK === status
    ).length;
    const percentageJustified = getPercentage(
      contJustifyPermission,
      object.permissions.length
    );
    sumPercentage += percentageJustified;
    const newPermission: PdfDataPer = {
      ...object,
      percentageJustified,
      percentageJustifiedLabel: `${Math.trunc(
        transformPercentage(percentageJustified) * 100
      )}%`,
    };
    return [permission, newPermission] as const;
  });

  const totalPercentage = getPercentage(
    sumPercentage,
    groupedPermissionsWithPercentage.length
  );
  groupedPermissionsWithPercentage.sort((a, b) => {
    const numA = parseInt(a[0].replace('M', ''), 10);
    const numB = parseInt(b[0].replace('M', ''), 10);
    return numA - numB;
  });

  return {
    status: evaluateStatus(totalPercentage * 100).category,
    percentage: totalPercentage,
    percentageLabel: `${Math.trunc(
      transformPercentage(totalPercentage) * 100
    )}%`,
    owasp: Object.fromEntries(groupedPermissionsWithPercentage),
  };
};

export default transformDataForPdf;
