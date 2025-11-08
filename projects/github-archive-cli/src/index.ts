#!/usr/bin/env node

import { Command } from 'commander';
import { archiveMode } from './commands/archive.js';
import { migrateMode } from './commands/migrate.js';

const program = new Command();

program
  .name('gh-archive')
  .description('Interactive CLI for archiving GitHub repositories')
  .version('1.0.0');

program
  .command('archive')
  .description('Mark a GitHub repository as archived')
  .argument('[repository]', 'Repository identifier (owner/repo or GitHub URL)')
  .action(async (repository?: string) => {
    await archiveMode(repository);
  });

program
  .command('migrate')
  .description('Move repository to another git server and optionally delete from GitHub')
  .argument('[repository]', 'Repository identifier (owner/repo or GitHub URL)')
  .action(async (repository?: string) => {
    await migrateMode(repository);
  });

program.parse(process.argv);

// Show help if no command is provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
