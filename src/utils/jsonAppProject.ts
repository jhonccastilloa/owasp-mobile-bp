import fs from 'fs';
import path from 'path';

interface AppProjectData {
  displayName: string;
}

export const getJsonAppProject = (currentPath: string): AppProjectData => {
  try {
    const appJson = JSON.parse(
      fs.readFileSync(path.join(currentPath, 'app.json'), 'utf-8')
    );
    return {
      displayName: appJson.displayName || appJson.name || path.basename(currentPath),
    };
  } catch {
    return {
      displayName: path.basename(currentPath),
    };
  }
};

