import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import inquirer from 'inquirer';
import { simpleGit } from 'simple-git';
import { createOctokit, parseRepoIdentifier, verifyRepoAccess } from '../utils/github.js';

export async function migrateMode(): Promise<void> {
  console.log(
    '\n🚚 Migrate Mode: Move repository to another git server and optionally delete from GitHub\n',
  );

  try {
    // Get repository identifier
    const { repoIdentifier } = await inquirer.prompt([
      {
        type: 'input',
        name: 'repoIdentifier',
        message: 'Enter GitHub repository (owner/repo or URL):',
        validate: (input: string) => {
          if (!input || input.trim().length === 0) {
            return 'Repository identifier is required';
          }
          try {
            parseRepoIdentifier(input);
            return true;
          } catch (_error) {
            return 'Invalid format. Use "owner/repo" or GitHub URL';
          }
        },
      },
    ]);

    const repo = parseRepoIdentifier(repoIdentifier);
    console.log(`\n📦 Repository: ${repo.owner}/${repo.repo}`);

    // Get destination git URL
    const { destinationUrl } = await inquirer.prompt([
      {
        type: 'input',
        name: 'destinationUrl',
        message: 'Enter destination git repository URL:',
        validate: (input: string) => {
          if (!input || input.trim().length === 0) {
            return 'Destination URL is required';
          }
          // Basic validation for git URL format
          if (!input.includes('://') && !input.includes('@')) {
            return 'Invalid git URL format';
          }
          return true;
        },
      },
    ]);

    // Ask if user wants to delete from GitHub after migration
    const { deleteFromGitHub } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'deleteFromGitHub',
        message:
          'Delete repository from GitHub after successful migration? (WARNING: This cannot be undone)',
        default: false,
      },
    ]);

    // Authenticate with GitHub
    console.log('\n🔐 Authenticating with GitHub...');
    const octokit = await createOctokit();

    // Verify repository access
    console.log('🔍 Verifying repository access...');
    const hasAccess = await verifyRepoAccess(octokit, repo);

    if (!hasAccess) {
      console.error(`\n❌ Error: Unable to access repository ${repo.owner}/${repo.repo}`);
      console.error(
        'Please check that the repository exists and you have the necessary permissions.',
      );
      process.exit(1);
    }

    // Final confirmation
    console.log('\n📋 Migration Summary:');
    console.log(`   Source: ${repo.owner}/${repo.repo} (GitHub)`);
    console.log(`   Destination: ${destinationUrl}`);
    console.log(`   Delete from GitHub: ${deleteFromGitHub ? 'Yes ⚠️' : 'No'}`);

    const { confirmed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmed',
        message: 'Proceed with migration?',
        default: false,
      },
    ]);

    if (!confirmed) {
      console.log('\n👋 Cancelled.');
      return;
    }

    // Create temporary directory for cloning
    console.log('\n📥 Creating temporary workspace...');
    const tempDir = await mkdtemp(join(tmpdir(), 'gh-archive-'));
    console.log(`   Temporary directory: ${tempDir}`);

    try {
      // Clone the repository
      console.log('\n📥 Cloning repository from GitHub...');
      const git = simpleGit();
      const cloneUrl = `https://github.com/${repo.owner}/${repo.repo}.git`;
      await git.clone(cloneUrl, tempDir, ['--mirror']);
      console.log('   ✅ Repository cloned');

      // Change to the cloned repository directory
      const repoGit = simpleGit(tempDir);

      // Push to destination
      console.log('\n📤 Pushing to destination git server...');
      console.log(`   Destination: ${destinationUrl}`);

      await repoGit.push(destinationUrl, '--mirror');
      console.log('   ✅ Successfully pushed to destination');

      // Delete from GitHub if requested
      if (deleteFromGitHub) {
        console.log('\n🗑️  Deleting repository from GitHub...');

        // Extra confirmation for deletion
        const { finalConfirm } = await inquirer.prompt([
          {
            type: 'input',
            name: 'finalConfirm',
            message: `Type the repository name "${repo.repo}" to confirm deletion:`,
            validate: (input: string) => {
              if (input === repo.repo) {
                return true;
              }
              return `You must type "${repo.repo}" to confirm`;
            },
          },
        ]);

        if (finalConfirm === repo.repo) {
          await octokit.repos.delete({
            owner: repo.owner,
            repo: repo.repo,
          });
          console.log('   ✅ Repository deleted from GitHub');
        }
      }

      console.log('\n✅ Migration completed successfully!');
      console.log('\n📋 Next steps:');
      console.log('   1. Verify the repository at the destination');
      console.log('   2. Update any CI/CD pipelines or webhooks');
      console.log('   3. Update documentation with the new repository location');
    } finally {
      // Clean up temporary directory
      console.log('\n🧹 Cleaning up temporary files...');
      await rm(tempDir, { recursive: true, force: true });
      console.log('   ✅ Cleanup complete');
    }
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
