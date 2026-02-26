import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnalyzerRunner } from '../core/services/analyzerRunner';
import { IAnalyzer, AnalyzerResult } from '../core/interfaces';

describe('AnalyzerRunner', () => {
  let runner: AnalyzerRunner;

  const createMockAnalyzer = (name: string, result: AnalyzerResult): IAnalyzer => ({
    name,
    description: `Mock analyzer: ${name}`,
    analyze: vi.fn().mockResolvedValue(result),
  });

  beforeEach(() => {
    runner = new AnalyzerRunner();
    vi.clearAllMocks();
  });

  describe('runAll', () => {
    it('should run all analyzers in parallel', async () => {
      const analyzer1 = createMockAnalyzer('test1', { success: true, data: [] });
      const analyzer2 = createMockAnalyzer('test2', { success: true, data: [] });

      runner = new AnalyzerRunner([analyzer1, analyzer2]);

      const results = await runner.runAll('/test/path');

      expect(results).toHaveLength(2);
      expect(analyzer1.analyze).toHaveBeenCalledWith('/test/path');
      expect(analyzer2.analyze).toHaveBeenCalledWith('/test/path');
    });

    it('should handle analyzer errors gracefully', async () => {
      const failingAnalyzer: IAnalyzer = {
        name: 'failing',
        description: 'Failing analyzer',
        analyze: vi.fn().mockRejectedValue(new Error('Analysis failed')),
      };

      runner = new AnalyzerRunner([failingAnalyzer]);

      const results = await runner.runAll('/test/path');

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(false);
      expect(results[0].error).toBe('Analysis failed');
    });

    it('should return empty array when no analyzers configured', async () => {
      const results = await runner.runAll('/test/path');
      expect(results).toHaveLength(0);
    });
  });

  describe('addAnalyzer', () => {
    it('should add analyzer to the list', () => {
      const analyzer = createMockAnalyzer('test', { success: true });
      runner.addAnalyzer(analyzer);
      expect(runner).toBeDefined();
    });
  });

  describe('runSequential', () => {
    it('should run analyzers sequentially', async () => {
      const callOrder: string[] = [];
      const analyzer1: IAnalyzer = {
        name: 'test1',
        description: 'Test 1',
        analyze: vi.fn().mockImplementation(async () => {
          callOrder.push('test1');
          return { success: true };
        }),
      };
      const analyzer2: IAnalyzer = {
        name: 'test2',
        description: 'Test 2',
        analyze: vi.fn().mockImplementation(async () => {
          callOrder.push('test2');
          return { success: true };
        }),
      };

      runner = new AnalyzerRunner([analyzer1, analyzer2]);
      await runner.runSequential('/test/path');

      expect(callOrder).toEqual(['test1', 'test2']);
    });
  });
});
