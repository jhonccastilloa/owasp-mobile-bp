import { IAnalyzer, AnalyzerResult } from '../interfaces/index.js';
import { logger } from '../../utils/logger.js';

export class AnalyzerRunner {
  private analyzers: IAnalyzer[];

  constructor(analyzers: IAnalyzer[] = []) {
    this.analyzers = analyzers;
  }

  addAnalyzer(analyzer: IAnalyzer): void {
    this.analyzers.push(analyzer);
  }

  async runAll(projectPath: string): Promise<AnalyzerResult[]> {
    logger.section('Running Analyzers');

    const results = await Promise.all(
      this.analyzers.map(analyzer =>
        this.runWithLogging(analyzer, projectPath)
      )
    );

    return results;
  }

  private async runWithLogging(
    analyzer: IAnalyzer,
    projectPath: string
  ): Promise<AnalyzerResult> {
    logger.info(`Running ${analyzer.name}...`);
    const startTime = Date.now();

    try {
      const result = await analyzer.analyze(projectPath);
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      if (result.success) {
        logger.success(`${analyzer.name} completed (${duration}s)`);
      } else {
        logger.warn(`${analyzer.name} found issues (${duration}s)`);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`${analyzer.name} failed: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async runSequential(projectPath: string): Promise<AnalyzerResult[]> {
    logger.section('Running Analyzers');

    const results: AnalyzerResult[] = [];

    for (const analyzer of this.analyzers) {
      const result = await this.runWithLogging(analyzer, projectPath);
      results.push(result);
    }

    return results;
  }
}
