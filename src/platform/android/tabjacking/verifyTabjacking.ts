import { cleanBlockAndLineComment } from '@/utils/tool';

const mainActivityOnCreateRegex =
  /protected\s+void\s+onCreate\s*\(Bundle\s+savedInstanceState\) \{([\s\S]*?)\}/;

const ifConditionRegex = /\/\/if\s*\([^)]*\)\s*\{[^}]*\}\s*/g;

const tabjackingRegex =
  /\bView\s+v\s*=\s*findViewById\(android\.R\.id\.content\);\s*v\.setFilterTouchesWhenObscured\(true\);/;

const importRegex = /import\s+android.view.View\s*;/;

const verifyTabjackingInMainActivity = async (
  mainActivityFile: string | null
) => {
  let message = '';
  let status = false;
  if (!mainActivityFile) {
    message =
      'Error: Archivo MainActivity.java no encontrado en la ruta esperada.';
    return { status, message };
  }

  const mainActivityFileWithoutComments =
    cleanBlockAndLineComment(mainActivityFile).newData;
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
