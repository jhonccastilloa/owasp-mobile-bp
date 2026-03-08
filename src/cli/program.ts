import { Command, Option } from 'commander';
import { logger } from '@/utils/logger';
import { PlatformScope } from '@/types/audit';
import { CLI_VERSION, DOCUMENTATION_URL } from '@/constants/cli';

const setVerboseMode = (command: Command) => {
  const globalOptions = command.parent?.opts();
  logger.setVerbose(Boolean(globalOptions?.verbose));
};

export const createProgram = (): Command => {
  const program = new Command();

  program
    .name('owasp-bp')
    .description('OWASP Mobile Security Verification CLI Tool')
    .version(CLI_VERSION)
    .option('-v, --verbose', 'Enable verbose output', false)
    .showHelpAfterError('(run with --help for usage)')
    .exitOverride();

  const withAuditOptions = (command: Command) =>
    command
      .option('-p, --path <path>', 'Project path', process.cwd())
      .addOption(
        new Option('--platform <platform>', 'Platform: android|ios|all')
          .choices(['android', 'ios', 'all'])
          .default('all')
      )
      .option(
        '--include-dev-dependencies',
        'Analyze devDependencies for vulnerable libraries',
        false
      );

  withAuditOptions(
    program
      .command('verify')
    .description('Analyze project for security issues')
    .action(async (options, command) => {
      setVerboseMode(command);
      const { verify } = await import('@/commands/verify');
      await verify(options.path, {
        platform: options.platform as PlatformScope,
        includeDevDependencies: options.includeDevDependencies,
      });
    })
  );

  withAuditOptions(
    program
      .command('automate')
    .description('Automatically fix detected issues')
    .action(async (options, command) => {
      setVerboseMode(command);
      const { automate } = await import('@/commands/automate');
      await automate(options.path, {
        platform: options.platform as PlatformScope,
        includeDevDependencies: options.includeDevDependencies,
      });
    })
  );

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
