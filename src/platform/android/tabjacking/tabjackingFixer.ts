import { getMainActivityJava } from '@/utils/androidFiles';
import verifyTabjackingInMainActivity from './verifyTabjacking';
import fs from 'fs';

const tabjackingSolution = `
        View v = findViewById(android.R.id.content);
        v.setFilterTouchesWhenObscured(true);
`;
const tabjackingFix = async (currentPath: string) => {
  const { mainActivityFile, mainActivityPath } = await getMainActivityJava(
    currentPath
  );
  const { status } = await verifyTabjackingInMainActivity(mainActivityFile);
  if (status) return;

  if (!mainActivityFile || !mainActivityPath) return;
  const onCreateRegex =
    /(protected void onCreate\(Bundle savedInstanceState\) \{)/;
  let mainActivityFix = mainActivityFile.replace(
    onCreateRegex,
    `$1${tabjackingSolution}`
  );
  mainActivityFix = 'import android.view.View;\n' + mainActivityFix;
  fs.writeFileSync(mainActivityPath, mainActivityFix, 'utf-8');
  console.log('✅ Protección contra tabjacking aplicada correctamente.');
};

export default tabjackingFix;
