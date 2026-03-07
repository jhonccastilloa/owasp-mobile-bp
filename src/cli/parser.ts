export type CliCommand = 'verify' | 'automate' | 'documentation' | undefined;

export interface ParsedArguments {
  command: CliCommand;
  path: string;
  verbose: boolean;
  platform: 'android' | 'ios' | 'all';
  safe: boolean;
  fixRisky: boolean;
  reportFormat: 'pdf' | 'json' | 'both';
  includeDevDependencies: boolean;
}

export const parseArguments = (argv: string[]): ParsedArguments => {
  const args = argv.slice(2);
  const command = args[0] as CliCommand;
  let path = process.cwd();
  let platform: ParsedArguments['platform'] = 'all';
  let safe = true;
  let fixRisky = false;
  let reportFormat: ParsedArguments['reportFormat'] = 'both';
  let includeDevDependencies = false;

  for (let i = 1; i < args.length; i += 1) {
    if ((args[i] === '--path' || args[i] === '-p') && args[i + 1]) {
      path = args[i + 1];
      i += 1;
    } else if (args[i] === '--platform' && args[i + 1]) {
      const next = args[i + 1];
      if (next === 'android' || next === 'ios' || next === 'all') {
        platform = next;
      }
      i += 1;
    } else if (args[i] === '--no-safe') {
      safe = false;
    } else if (args[i] === '--safe') {
      safe = true;
    } else if (args[i] === '--fix-risky') {
      fixRisky = true;
    } else if (args[i] === '--report-format' && args[i + 1]) {
      const next = args[i + 1];
      if (next === 'pdf' || next === 'json' || next === 'both') {
        reportFormat = next;
      }
      i += 1;
    } else if (args[i] === '--include-dev-dependencies') {
      includeDevDependencies = true;
    }
  }

  return {
    command,
    path,
    verbose: args.includes('--verbose') || args.includes('-v'),
    platform,
    safe,
    fixRisky,
    reportFormat,
    includeDevDependencies,
  };
};
