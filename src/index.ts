import { Command } from 'commander';
import { verify } from './commands/verify.js';
import { automate } from './commands/automate.js';
import { openUrl } from './utils/openUrl.js';
import { logger } from './utils/logger.js';

const DOCUMENTATION_URL =
  'https://github.com/jhonccastilloa/owasp-mobile-bp/blob/main/DOCUMENTATION.md';

const program = new Command();

program
  .name('owasp-bp')
  .description('OWASP Mobile Security Verification CLI Tool')
  .version('1.0.6')
  .option('-v, --verbose', 'Enable verbose output', false);

program
  .command('verify')
  .description('Analyze project for security issues')
  .option('-p, --path <path>', 'Project path', process.cwd())
  .action(async (options, command) => {
    const globalOptions = command.parent.opts();
    logger.setVerbose(globalOptions.verbose);
    await verify(options.path);
  });

program
  .command('automate')
  .description('Automatically fix detected issues')
  .option('-p, --path <path>', 'Project path', process.cwd())
  .action(async (options, command) => {
    const globalOptions = command.parent.opts();
    logger.setVerbose(globalOptions.verbose);
    await automate(options.path);
  });

program
  .command('documentation')
  .description('Open documentation in browser')
  .action(async () => {
    logger.info('Opening documentation...');
    await openUrl(DOCUMENTATION_URL);
    logger.success('Documentation opened in browser');
  });

program.parseAsync(process.argv);