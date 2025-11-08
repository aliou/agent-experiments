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
