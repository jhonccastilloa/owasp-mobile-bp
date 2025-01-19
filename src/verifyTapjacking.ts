import path from 'path';
import { PermissionData } from './types/global';
import { PermissionStatus } from './types/enums';
import { cleanJavaComments, searchFile } from './utils/tool';

const regexOnCreate =
  /protected\s+void\s+onCreate\s*\(Bundle\s+savedInstanceState\) \{([\s\S]*?)\}/;
const regexCondition = /\/\/if\s*\([^)]*\)\s*\{[^}]*\}\s*/g;

const codeRegex =
  /\bView\s+v\s*=\s*findViewById\(android\.R\.id\.content\);\s*v\.setFilterTouchesWhenObscured\(true\);/;

const importRegex = /import\s+android.view.View\s*;/;

export const verifyTapjacking = async (currentPath: string) => {
  try {
    const javaComPath = path.join(
      currentPath,
      'android',
      'app',
      'src',
      'main',
      'java',
      'com'
    );

    let status = false;
    const content: string | null = await searchFile(
      javaComPath,
      'MainActivity.java'
    );
    if (content) {
      const cleanComments = cleanJavaComments(content);
      const cleanCondition = cleanComments.replace(regexCondition, '');
      const match = cleanCondition.match(regexOnCreate);
      if (
        match &&
        codeRegex.test(match[1]) &&
        importRegex.test(cleanCondition)
      ) {
        status = true;
      }
    }
    const data: PermissionData = {
      numLine: null,
      status: status ? PermissionStatus.OK : PermissionStatus.NOT_FOUND,
      permission: 'Prevencion contra Tapjacking',
      severity: 'E',
      message:
        'Se ha encontrado la prevención contra Tapjacking en el archivo MainActivity.java',
      owaspCategory: 'M7',
      nameFile: 'MainActivity.java',
    };
    return data;
  } catch (error) {
    console.error(
      '❌ ERROR: No se pudo leer el archivo MainActivity.java',
      error
    );
  }
};
