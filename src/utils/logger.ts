import chalk from 'chalk';
import ora, { Ora } from 'ora';

type LogLevel = 'info' | 'success' | 'warn' | 'error' | 'debug';

class Logger {
  private verbose: boolean = false;
  private spinner: Ora | null = null;

  setVerbose(enabled: boolean): void {
    this.verbose = enabled;
  }

  private format(level: LogLevel, message: string): string {
    const prefixes: Record<LogLevel, string> = {
      info: 'ℹ',
      success: '✓',
      warn: '⚠',
      error: '✗',
      debug: '›',
    };

    const colors: Record<LogLevel, (msg: string) => string> = {
      info: chalk.blue,
      success: chalk.green,
      warn: chalk.yellow,
      error: chalk.red,
      debug: chalk.gray,
    };

    return `${colors[level](prefixes[level])} ${message}`;
  }

  info(message: string): void {
    console.log(this.format('info', message));
  }

  success(message: string): void {
    console.log(this.format('success', message));
  }

  warn(message: string): void {
    console.log(this.format('warn', message));
  }

  error(message: string): void {
    console.error(this.format('error', message));
  }

  debug(message: string): void {
    if (this.verbose) {
      console.log(this.format('debug', message));
    }
  }

  section(title: string): void {
    console.log(chalk.bold.cyan(`\n${title}\n`));
  }

  startSpinner(text: string): void {
    this.spinner = ora(text).start();
  }

  succeedSpinner(text?: string): void {
    if (this.spinner) {
      this.spinner.succeed(text);
      this.spinner = null;
    }
  }

  failSpinner(text?: string): void {
    if (this.spinner) {
      this.spinner.fail(text);
      this.spinner = null;
    }
  }

  stopSpinner(): void {
    if (this.spinner) {
      this.spinner.stop();
      this.spinner = null;
    }
  }
}

export const logger = new Logger();
