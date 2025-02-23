import verifyProguardConfig from './verifyProguardConfig';

const javaLogsFix = (currentPath: string) => {
  verifyProguardConfig(currentPath, { repair: true });
};

export default javaLogsFix