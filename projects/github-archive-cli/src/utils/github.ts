import { Octokit } from '@octokit/rest';
import inquirer from 'inquirer';

export interface GitHubRepo {
  owner: string;
  repo: string;
}

/**
 * Parse a GitHub repository URL or owner/repo format
 */
export function parseRepoIdentifier(identifier: string): GitHubRepo {
  // Handle URL format: https://github.com/owner/repo
  const urlMatch = identifier.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (urlMatch) {
    return {
      owner: urlMatch[1],
      repo: urlMatch[2].replace(/\.git$/, ''),
    };
  }

  // Handle owner/repo format
  const parts = identifier.split('/');
  if (parts.length === 2) {
    return {
      owner: parts[0],
      repo: parts[1],
    };
  }

  throw new Error('Invalid repository identifier. Use "owner/repo" or GitHub URL format.');
}

/**
 * Get GitHub token from user input or environment
 */
export async function getGitHubToken(): Promise<string> {
  const envToken = process.env.GITHUB_TOKEN;

  if (envToken) {
    const { useEnvToken } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'useEnvToken',
        message: 'Found GITHUB_TOKEN in environment. Use it?',
        default: true,
      },
    ]);

    if (useEnvToken) {
      return envToken;
    }
  }

  const { token } = await inquirer.prompt([
    {
      type: 'password',
      name: 'token',
      message: 'Enter your GitHub personal access token:',
      validate: (input: string) => {
        if (!input || input.trim().length === 0) {
          return 'Token is required';
        }
        return true;
      },
    },
  ]);

  return token;
}

/**
 * Create an authenticated Octokit instance
 */
export async function createOctokit(): Promise<Octokit> {
  const token = await getGitHubToken();
  return new Octokit({ auth: token });
}

/**
 * Verify that the repository exists and the user has access
 */
export async function verifyRepoAccess(octokit: Octokit, repo: GitHubRepo): Promise<boolean> {
  try {
    await octokit.repos.get({
      owner: repo.owner,
      repo: repo.repo,
    });
    return true;
  } catch (_error) {
    return false;
  }
}

/**
 * List user's repositories and let them select one
 */
export async function selectRepositoryFromList(octokit: Octokit): Promise<GitHubRepo> {
  console.log('🔍 Fetching your repositories...');

  // Fetch repositories (paginated)
  const repos = await octokit.paginate(octokit.repos.listForAuthenticatedUser, {
    sort: 'updated',
    per_page: 100,
    affiliation: 'owner,collaborator,organization_member',
  });

  if (repos.length === 0) {
    throw new Error('No repositories found for your account.');
  }

  console.log(`\n✓ Found ${repos.length} repositories\n`);

  // Format choices for inquirer
  const choices = repos.map((repo) => ({
    name: `${repo.full_name}${repo.archived ? ' [ARCHIVED]' : ''}${repo.private ? ' [PRIVATE]' : ''}`,
    value: repo.full_name,
    short: repo.full_name,
  }));

  const { selectedRepo } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedRepo',
      message: 'Select a repository:',
      choices,
      pageSize: 15,
      loop: false,
    },
  ]);

  return parseRepoIdentifier(selectedRepo);
}

/**
 * Get repository either from provided identifier or by interactive selection
 */
export async function getRepository(
  octokit: Octokit,
  providedIdentifier?: string,
): Promise<GitHubRepo> {
  if (providedIdentifier) {
    // Use provided repository identifier
    return parseRepoIdentifier(providedIdentifier);
  }

  // Ask user how they want to select the repository
  const { selectionMethod } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectionMethod',
      message: 'How would you like to select a repository?',
      choices: [
        { name: 'Choose from my repositories', value: 'list' },
        { name: 'Enter repository manually', value: 'manual' },
      ],
    },
  ]);

  if (selectionMethod === 'list') {
    return await selectRepositoryFromList(octokit);
  }

  // Manual entry
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

  return parseRepoIdentifier(repoIdentifier);
}
