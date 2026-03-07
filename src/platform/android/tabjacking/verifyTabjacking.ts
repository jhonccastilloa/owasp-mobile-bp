import { cleanBlockAndLineComment } from '@/utils/tool';
import path from 'path';

const mainActivityOnCreateRegex =
  /protected\s+void\s+onCreate\s*\(Bundle\s+savedInstanceState\) \{([\s\S]*?)\}/;

const ifConditionRegex = /\/\/if\s*\([^)]*\)\s*\{[^}]*\}\s*/g;

const tabjackingRegex =
  /\bView\s+v\s*=\s*findViewById\(android\.R\.id\.content\);\s*v\.setFilterTouchesWhenObscured\(true\);/;

const importRegex = /import\s+android.view.View\s*;/;

const verifyTabjackingInMainActivity = async (
  mainActivityFile: string | null,
  mainActivityPath: string | null = null
) => {
  let message = '';
  let status = false;
  const extension = mainActivityPath ? path.extname(mainActivityPath) : '.java';
  if (!mainActivityFile) {
    message =
      'Error: Archivo MainActivity no encontrado en la ruta esperada.';
    return { status, message };
  }

  const mainActivityFileWithoutComments =
    cleanBlockAndLineComment(mainActivityFile).newData;

  if (extension === '.kt') {
    const hasTabjackingSnippet =
      mainActivityFileWithoutComments.includes('findViewById<View>(android.R.id.content)') &&
      (mainActivityFileWithoutComments.includes('filterTouchesWhenObscured = true') ||
        mainActivityFileWithoutComments.includes(
          'setFilterTouchesWhenObscured(true)'
        ));
    if (!hasTabjackingSnippet) {
      return {
        status: false,
        message:
          'Tabjacking no detectado en onCreate. Se recomienda agregar la protección en MainActivity.kt.',
      };
    }
    if (!/import\s+android\.view\.View/.test(mainActivityFileWithoutComments)) {
      return {
        status: false,
        message:
          'Advertencia: La protección contra Tabjacking está presente, pero falta la importación de android.view.View.',
      };
    }
    return {
      status: true,
      message: 'Tabjacking correctamente implementado en MainActivity.kt.',
    };
  }

  const mainActivityFileWithoutIfConditions =
    mainActivityFileWithoutComments.replace(ifConditionRegex, '');
  const extractOnCreateFunction = mainActivityFileWithoutIfConditions.match(
    mainActivityOnCreateRegex
  );

  if (!extractOnCreateFunction) {
    message =
      'Advertencia: No se pudo encontrar el método onCreate en MainActivity.java.';
    return { status, message };
  }

  if (!tabjackingRegex.test(extractOnCreateFunction[1])) {
    message =
      'Tabjacking no detectado en onCreate. Se recomienda agregar la protección.';
    return { status, message };
  }

  if (!importRegex.test(mainActivityFileWithoutComments)) {
    message =
      'Advertencia: La protección contra Tabjacking está presente, pero falta la importación de android.view.View.';
    return { status, message };
  }
  status = true;
  message = 'Tabjacking correctamente implementado en MainActivity.java.';

  return { status, message };
};

export default verifyTabjackingInMainActivity;
