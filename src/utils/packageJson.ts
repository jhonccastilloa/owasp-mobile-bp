import path from 'path';
import fs from 'fs';
export const getPackageFilePath = (currentPath: string) =>
  path.join(currentPath, 'package.json');

export const getPackageJson = async (currentPath: string) => {
  const packageFilePath = getPackageFilePath(currentPath);
  const data = await fs.promises.readFile(packageFilePath, 'utf-8');
  const jsonData = JSON.parse(data);
  return jsonData;
};

export const getPackageDependencies = async (currentPath: string) => {
  const packageJson = await getPackageJson(currentPath);
  return packageJson.dependencies || {};
};
export const getPackageDependencyNames = async (currentPath: string) => {
  const dependencies = await getPackageDependencies(currentPath);
  return Object.keys(dependencies);
};
