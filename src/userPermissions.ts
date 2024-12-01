import fs from "fs";
import path from "path";
import { REQUIRED_PERMISSIONS } from "./data/userPermissionData";
import { VerifyUserPermission } from "./types/global";



interface AMUserPermision {
  permission: string;
  numLine: number
}


const getDependencies = async (packageFilePath: string): Promise<string[]> => {
  const data = await fs.promises.readFile(packageFilePath, "utf-8");
  const jsonData = JSON.parse(data);
  return Object.keys(jsonData.dependencies || {});
};

const getManifestPermissions = async (
  androidManifestFilePath: string
): Promise<AMUserPermision[]> => {
  const readData = await fs.promises.readFile(androidManifestFilePath, "utf-8");
  // const data = readData.replace(/<!--([\s\S]+)-->/g, "")
  let match1: RegExpExecArray | null;
  const regex1 = /<!--([\s\S]*?)-->/g;
  let data = ""
  while ((match1 = regex1.exec(readData)) !== null) {
    data = readData.replace(match1[0], match1[0].split('\n').map((_, i) => i).join('\n'))
  }
  const regex = /<uses-permission\s+android:name\s*?=\s*?"([^"]+)"/g;
  let match: RegExpExecArray | null;
  const permissions: AMUserPermision[] = []
  while ((match = regex.exec(data)) !== null) {
    const matchPosition = match.index;
    const linesUpToMatch = data.substring(0, matchPosition).split('\n').length;
    permissions.push({
      permission: match[1].replace('android.permission.', ''),
      numLine: linesUpToMatch
    });
  }
  return permissions;
};

const verifyPermissions = async (currentPath: string): Promise<VerifyUserPermission[] | undefined> => {
  try {
    const packageFilePath = path.join(currentPath, "package.json");
    const dependencies = new Set(await getDependencies(packageFilePath));
    const manifestPath = path.join(
      currentPath,
      "android",
      "app",
      "src",
      "main",
      "AndroidManifest.xml"
    );
    const manifestPermissions = await getManifestPermissions(manifestPath);
    const owaspPermission = []

    for (const manifestPermission of manifestPermissions) {
      const requiredPermission = REQUIRED_PERMISSIONS[manifestPermission.permission]
      if (requiredPermission) {
        const hasRequiredDependency = requiredPermission.requiredDependencies.some((dep) =>
          dependencies.has(dep)
        );
        owaspPermission.push({
          permission: manifestPermission.permission,
          numLine: manifestPermission.numLine,
          owaspCategory: requiredPermission.owaspCategory,
          severity: requiredPermission.severity,
          justifyPermission: hasRequiredDependency
        })
      }
    }

    return owaspPermission

  } catch (error) {
    console.log(error);
  }
  console.log("finalizo")
};
export default verifyPermissions;


// const test = () => {
//   verifyPermissions('./example')
// }
// test()