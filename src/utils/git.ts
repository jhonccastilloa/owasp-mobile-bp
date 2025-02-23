import { execSync } from "child_process";

export const currentGitBranch = execSync('git rev-parse --abbrev-ref HEAD', {
  encoding: 'utf-8',
}).trim();
