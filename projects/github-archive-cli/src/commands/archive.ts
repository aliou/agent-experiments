import inquirer from 'inquirer';
import { createOctokit, parseRepoIdentifier, verifyRepoAccess } from '../utils/github.js';

export async function archiveMode(): Promise<void> {
  console.log('\n🗄️  Archive Mode: Mark GitHub repository as archived\n');

  try {
    // Get repository identifier
    const { repoIdentifier } = await inquirer.prompt([
      {
        type: 'input',
        name: 'repoIdentifier',
        message: 'Enter repository (owner/repo or GitHub URL):',
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

    // Get current repository status
    const repoData = await octokit.repos.get({
      owner: repo.owner,
      repo: repo.repo,
    });

    if (repoData.data.archived) {
      console.log('\n⚠️  This repository is already archived.');
      const { proceed } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'proceed',
          message: 'Do you want to continue anyway?',
          default: false,
        },
      ]);

      if (!proceed) {
        console.log('\n👋 Cancelled.');
        return;
      }
    }

    // Confirm archival
    const { confirmed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmed',
        message: `Are you sure you want to archive ${repo.owner}/${repo.repo}?`,
        default: false,
      },
    ]);

    if (!confirmed) {
      console.log('\n👋 Cancelled.');
      return;
    }

    // Archive the repository
    console.log('\n📦 Archiving repository...');
    await octokit.repos.update({
      owner: repo.owner,
      repo: repo.repo,
      archived: true,
    });

    console.log(`\n✅ Successfully archived ${repo.owner}/${repo.repo}!`);
    console.log(
      '\nNote: Archived repositories are read-only. Users can still view and fork the repository.',
    );
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
