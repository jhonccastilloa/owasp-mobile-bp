export const toAndroidPermissionName = (permission: string) =>
  `android.permission.${permission}`;

export const createAndroidPermissionRegex = (permission: string) =>
  new RegExp(
    `<uses-permission\\b[^>]*android:name\\s*=\\s*"${toAndroidPermissionName(
      permission
    ).replace(/\./g, '\\.')}"[^>]*\\/?>\\s*\\n?`,
    'g'
  );
