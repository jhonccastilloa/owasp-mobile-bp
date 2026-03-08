import { CommanderError } from 'commander';
import { createProgram } from './cli/program.js';
import { logger } from './utils/logger.js';
import { toErrorMessage } from './utils/error.js';

export const run = async (argv: string[] = process.argv): Promise<void> => {
  const program = createProgram();
  await program.parseAsync(argv);
};

run().catch(error => {
  if (error instanceof CommanderError) {
    if (
      error.code === 'commander.helpDisplayed' ||
      error.code === 'commander.version'
    ) {
      process.exitCode = 0;
      return;
    }

    logger.error(error.message);
  } else {
    logger.error(`Unexpected error: ${toErrorMessage(error)}`);
  }
  process.exitCode = 1;
});
