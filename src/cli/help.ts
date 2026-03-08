import chalk from 'chalk';
import { CLI_VERSION } from '@/constants/cli';

export const printHelp = () => {
  console.log(`
${chalk.bold.cyan('OWASP Mobile BP')} - Security Verification Tool
${chalk.gray('Version')} ${chalk.white(CLI_VERSION)}

${chalk.bold('Usage:')}
  ${chalk.green('owasp-bp')} ${chalk.yellow('<command>')} [options]

${chalk.bold('Commands:')}
  ${chalk.yellow('verify')}         ${chalk.gray('Analyze project for security issues')}
  ${chalk.yellow('automate')}      ${chalk.gray('Automatically fix detected issues')}
  ${chalk.yellow('documentation')} ${chalk.gray('Open documentation in browser')}

${chalk.bold('Options:')}
  ${chalk.green('-h, --help')}     ${chalk.gray('Show this help message')}
  ${chalk.green('-v, --version')}  ${chalk.gray('Show version number')}
  ${chalk.green('-p, --path')}      ${chalk.gray('Specify project path (default: current directory)')}
  ${chalk.green('--verbose')}       ${chalk.gray('Enable verbose output')}

${chalk.bold('Examples:')}
  ${chalk.gray('# Analyze current directory')}
  ${chalk.green('owasp-bp verify')}

  ${chalk.gray('# Analyze specific project')}
  ${chalk.green('owasp-bp verify --path /path/to/project')}

  ${chalk.gray('# Auto-fix issues')}
  ${chalk.green('owasp-bp automate --path /path/to/project')}

${chalk.bold('For more information:')}
  ${chalk.blue('https://github.com/jhonccastilloa/owasp-mobile-bp')}
`);
};

export const printVersion = () => {
  console.log(CLI_VERSION);
};

export const printUnknownCommand = (command: string) => {
  console.error(`
${chalk.red('✗ Unknown command:')} ${chalk.yellow(command)}

${chalk.gray('Run')} ${chalk.green('owasp-bp --help')} ${chalk.gray('to see available commands')}
`);
};
