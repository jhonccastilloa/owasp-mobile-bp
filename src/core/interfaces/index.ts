export interface AnalyzerResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface FixerResult {
  success: boolean;
  file?: string;
  changes?: string[];
  error?: string;
}

export interface IAnalyzer {
  readonly name: string;
  readonly description: string;
  analyze(projectPath: string): Promise<AnalyzerResult>;
}

export interface IFixer {
  readonly name: string;
  readonly description: string;
  fix(projectPath: string): Promise<FixerResult>;
}

export interface AnalyzerModule {
  default: (projectPath: string) => Promise<unknown>;
}

export interface FixerModule {
  default: (projectPath: string) => Promise<unknown>;
}
