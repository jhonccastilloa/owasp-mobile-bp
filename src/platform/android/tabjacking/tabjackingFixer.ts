import { getMainActivityJava } from '@/utils/androidFiles';
import verifyTabjackingInMainActivity from './verifyTabjacking';
import fs from 'fs';
import { logger } from '@/utils/logger';
import path from 'path';

const tabjackingSolutionJava = `
        View v = findViewById(android.R.id.content);
        v.setFilterTouchesWhenObscured(true);
`;
const tabjackingSolutionKotlin = `
    val contentView = findViewById<View>(android.R.id.content)
    contentView.filterTouchesWhenObscured = true
`;
const tabjackingFix = async (currentPath: string) => {
  const { mainActivityFile, mainActivityPath } = await getMainActivityJava(
    currentPath
  );
  const { status } = await verifyTabjackingInMainActivity(
    mainActivityFile,
    mainActivityPath
  );
  if (status) return;

  if (!mainActivityFile || !mainActivityPath) return;
  const isKotlin = path.extname(mainActivityPath) === '.kt';
  const onCreateRegex = isKotlin
    ? /(override fun onCreate\(savedInstanceState: Bundle\?\) \{)/
    : /(protected void onCreate\(Bundle savedInstanceState\) \{)/;
  let mainActivityFix = mainActivityFile;
  if (onCreateRegex.test(mainActivityFix)) {
    mainActivityFix = mainActivityFix.replace(
      onCreateRegex,
      `$1${isKotlin ? tabjackingSolutionKotlin : tabjackingSolutionJava}`
    );
  }

  if (isKotlin && !mainActivityFix.includes('import android.view.View')) {
    mainActivityFix = `import android.view.View\n${mainActivityFix}`;
  }
  if (!isKotlin && !mainActivityFix.includes('import android.view.View;')) {
    mainActivityFix = `import android.view.View;\n${mainActivityFix}`;
  }

  fs.writeFileSync(mainActivityPath, mainActivityFix, 'utf-8');
  logger.success('Tabjacking protection applied successfully');
};

export default tabjackingFix;
