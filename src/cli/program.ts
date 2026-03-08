import { Command } from 'commander';
import { logger } from '@/utils/logger';
import { PlatformScope, ReportFormat } from '@/types/audit';

const DOCUMENTATION_URL =
  'https://github.com/jhonccastilloa/owasp-mobile-bp/blob/main/DOCUMENTATION.md';
const CliVersion = '1.0.6';

const setVerboseMode = (command: Command) => {
  const globalOptions = command.parent?.opts();
  logger.setVerbose(Boolean(globalOptions?.verbose));
};

export const createProgram = (): Command => {
  const program = new Command();

  program
    .name('owasp-bp')
    .description('OWASP Mobile Security Verification CLI Tool')
    .version(CliVersion)
    .option('-v, --verbose', 'Enable verbose output', false)
    .showHelpAfterError('(run with --help for usage)')
    .exitOverride();

  program
    .command('verify')
    .description('Analyze project for security issues')
    .option('-p, --path <path>', 'Project path', process.cwd())
    .option('--platform <platform>', 'Platform: android|ios|all', 'all')
    .option('--report-format <format>', 'Report format: pdf|json|both', 'both')
    .option('--include-dev-dependencies', 'Analyze devDependencies for vulnerable libraries', false)
    .action(async (options, command) => {
      setVerboseMode(command);
      const { verify } = await import('@/commands/verify');
      await verify(options.path, {
        platform: options.platform as PlatformScope,
        reportFormat: options.reportFormat as ReportFormat,
        includeDevDependencies: options.includeDevDependencies,
      });
    });

  program
    .command('automate')
    .description('Automatically fix detected issues')
    .option('-p, --path <path>', 'Project path', process.cwd())
    .option('--platform <platform>', 'Platform: android|ios|all', 'all')
    .option('--report-format <format>', 'Report format: pdf|json|both', 'both')
    .option('--include-dev-dependencies', 'Analyze devDependencies for vulnerable libraries', false)
    .action(async (options, command) => {
      setVerboseMode(command);
      const { automate } = await import('@/commands/automate');
      await automate(options.path, {
        platform: options.platform as PlatformScope,
        reportFormat: options.reportFormat as ReportFormat,
        includeDevDependencies: options.includeDevDependencies,
      });
    });

  program
    .command('documentation')
    .description('Open documentation in browser')
    .action(async (_, command) => {
      setVerboseMode(command);
      logger.info('Opening documentation...');
      const { openUrl } = await import('@/utils/openUrl');
      await openUrl(DOCUMENTATION_URL);
      logger.success('Documentation opened in browser');
    });

  return program;
};
