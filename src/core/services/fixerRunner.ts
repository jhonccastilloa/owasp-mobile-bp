import { IFixer, FixerResult } from '../interfaces/index.js';
import { logger } from '../../utils/logger.js';

export class FixerRunner {
  private fixers: IFixer[];

  constructor(fixers: IFixer[] = []) {
    this.fixers = fixers;
  }

  addFixer(fixer: IFixer): void {
    this.fixers.push(fixer);
  }

  async runAll(projectPath: string): Promise<FixerResult[]> {
    logger.section('Running Fixers');

    const results = await Promise.all(
      this.fixers.map(fixer =>
        this.runWithLogging(fixer, projectPath)
      )
    );

    return results;
  }

  private async runWithLogging(
    fixer: IFixer,
    projectPath: string
  ): Promise<FixerResult> {
    logger.info(`Running ${fixer.name}...`);
    const startTime = Date.now();

    try {
      const result = await fixer.fix(projectPath);
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      if (result.success) {
        logger.success(`${fixer.name} completed (${duration}s)`);
        if (result.changes && result.changes.length > 0) {
          result.changes.forEach(change => logger.debug(`  - ${change}`));
        }
      } else {
        logger.warn(`${fixer.name} could not complete: ${result.error || 'unknown'}`);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`${fixer.name} failed: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async runSequential(projectPath: string): Promise<FixerResult[]> {
    logger.section('Running Fixers');

    const results: FixerResult[] = [];

    for (const fixer of this.fixers) {
      const result = await this.runWithLogging(fixer, projectPath);
      results.push(result);
    }

    return results;
  }
}
