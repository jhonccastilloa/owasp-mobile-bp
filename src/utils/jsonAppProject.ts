import fs from 'fs';
import path from 'path';

export const getJsonAppProject = (currentPath: string) =>
  JSON.parse(fs.readFileSync(path.join(currentPath, 'app.json'), 'utf-8'));

