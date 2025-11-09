# GitHub Archive CLI

An interactive CLI tool for managing GitHub repository archival with two distinct modes:

1. **Archive Mode**: Simply mark a repository as archived on GitHub
2. **Migrate Mode**: Move a repository to another git server and optionally delete from GitHub

## Features

- 🔐 Secure GitHub authentication (supports `GITHUB_TOKEN` environment variable)
- 📋 Interactive repository selection - choose from your repositories or enter manually
- 🏢 Organization support - select repositories from your personal account or any organization
- 🎯 CLI argument support - pass repository as argument for automation
- 🎨 Interactive prompts for safe operations
- 📦 Mirror cloning to preserve all branches, tags, and history
- ⚠️ Multiple confirmation steps for destructive operations
- 🧹 Automatic cleanup of temporary files
- 💡 Clear progress indicators and helpful error messages

## Prerequisites

- Node.js 22+ (managed via Nix in this repository)
- GitHub Personal Access Token with appropriate permissions:
  - For archive mode: `repo` scope
  - For migrate mode with deletion: `repo` and `delete_repo` scopes

## Installation

```bash
# From the repository root
nix-shell
cd projects/github-archive-cli
pnpm install
pnpm build
```

## Usage

### Archive Mode

Mark a GitHub repository as archived (read-only).

**Interactive mode** (choose from your repositories or enter manually):

```bash
pnpm start archive
```

**With CLI argument** (for automation):

```bash
pnpm start archive owner/repo
# or
pnpm start archive https://github.com/owner/repo
```

The CLI will:
1. Authenticate with GitHub
2. Let you select a repository (or use the provided argument)
3. Verify access
4. Confirm the archive operation
5. Archive the repository

**Example (Interactive Selection):**
```
$ pnpm start archive
🗄️  Archive Mode: Mark GitHub repository as archived

🔐 Authenticating with GitHub...
? Found GITHUB_TOKEN in environment. Use it? Yes

? How would you like to select a repository?
❯ Choose from my repositories
  Enter repository manually

🔍 Checking for organizations...
✓ Found 2 organization(s)

? Select repository owner: (Use arrow keys)
❯ Your personal repositories
  acme-corp (Organization)
  github (Organization)

🔍 Fetching repositories...
✓ Found 42 repositories

? Select a repository: (Use arrow keys)
❯ octocat/Hello-World
  octocat/Spoon-Knife [ARCHIVED]
  octocat/test-repo [PRIVATE]
  ...

📦 Repository: octocat/Hello-World

🔍 Verifying repository access...
? Are you sure you want to archive octocat/Hello-World? Yes

📦 Archiving repository...
✅ Successfully archived octocat/Hello-World!

Note: Archived repositories are read-only. Users can still view and fork the repository.
```

**Example (CLI Argument):**
```bash
$ pnpm start archive octocat/Hello-World
🗄️  Archive Mode: Mark GitHub repository as archived

🔐 Authenticating with GitHub...
📦 Repository: octocat/Hello-World

🔍 Verifying repository access...
? Are you sure you want to archive octocat/Hello-World? Yes

📦 Archiving repository...
✅ Successfully archived octocat/Hello-World!
```

### Migrate Mode

Move a repository to another git server and optionally delete from GitHub.

**Interactive mode** (choose from your repositories or enter manually):

```bash
pnpm start migrate
```

**With CLI argument** (for automation):

```bash
pnpm start migrate owner/repo
# or
pnpm start migrate https://github.com/owner/repo
```

The CLI will:
1. Authenticate with GitHub
2. Let you select a repository (or use the provided argument)
3. Prompt for destination git URL
4. Ask whether to delete from GitHub after migration
5. Verify access and show migration summary
6. Perform mirror clone and push
7. Optionally delete from GitHub

**Example:**
```
$ pnpm start migrate myuser/old-project
🚚 Migrate Mode: Move repository to another git server and optionally delete from GitHub

🔐 Authenticating with GitHub...
📦 Repository: myuser/old-project

? Enter destination git repository URL: https://git.example.com/newuser/old-project.git
? Delete repository from GitHub after successful migration? (WARNING: This cannot be undone) Yes

🔍 Verifying repository access...

📋 Migration Summary:
   Source: myuser/old-project (GitHub)
   Destination: https://git.example.com/newuser/old-project.git
   Delete from GitHub: Yes ⚠️

? Proceed with migration? Yes

📥 Creating temporary workspace...
📥 Cloning repository from GitHub...
   ✅ Repository cloned

📤 Pushing to destination git server...
   ✅ Successfully pushed to destination

🗑️  Deleting repository from GitHub...
? Type the repository name "old-project" to confirm deletion: old-project
   ✅ Repository deleted from GitHub

🧹 Cleaning up temporary files...
   ✅ Cleanup complete

✅ Migration completed successfully!

📋 Next steps:
   1. Verify the repository at the destination
   2. Update any CI/CD pipelines or webhooks
   3. Update documentation with the new repository location
```

## Authentication

The CLI supports GitHub authentication in two ways:

1. **Environment Variable** (recommended):
   ```bash
   export GITHUB_TOKEN=ghp_your_token_here
   pnpm start archive
   ```

2. **Interactive Prompt**: If no environment variable is set, the CLI will securely prompt for your token

### Getting a GitHub Token

**Quick method** (if you have GitHub CLI installed):
```bash
# Get your current GitHub CLI token
export GITHUB_TOKEN=$(gh auth token)
pnpm start archive
```

**Manual method** (create a new Personal Access Token):
1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Select scopes:
   - For archive mode: `repo`
   - For migrate mode with deletion: `repo` and `delete_repo`
4. Generate and copy the token

## How It Works

### Archive Mode

1. Authenticates with GitHub using the Octokit REST API
2. Verifies access to the specified repository
3. Checks if the repository is already archived
4. Updates the repository settings to mark it as archived

### Migrate Mode

1. Authenticates with GitHub
2. Verifies access to the source repository
3. Creates a temporary directory
4. Performs a `--mirror` clone to preserve all branches, tags, and history
5. Pushes the mirrored repository to the destination git server
6. Optionally deletes the repository from GitHub (with additional confirmation)
7. Cleans up temporary files

## Safety Features

- **Multiple Confirmations**: Critical operations require explicit user confirmation
- **Repository Name Verification**: Deletion requires typing the exact repository name
- **Access Validation**: Verifies repository access before proceeding
- **Clear Warnings**: Destructive operations are clearly marked with ⚠️
- **Automatic Cleanup**: Temporary files are always cleaned up, even if errors occur

## Development

```bash
# Install dependencies
pnpm install

# Build the project
pnpm build

# Run in development mode
pnpm dev

# Run linting (uses Biome config from repository root)
pnpm lint

# Fix linting issues
pnpm lint:fix
```

## Technical Details

- **Language**: TypeScript
- **CLI Framework**: Commander.js
- **Interactive Prompts**: Inquirer.js
- **GitHub API**: Octokit REST API
- **Git Operations**: simple-git
- **Linting/Formatting**: Biome (inherited from monorepo root)

## Biome Configuration

This project uses the Biome configuration from the repository root (`../../biome.json`). Biome automatically searches upward in the directory tree to find the configuration file, so no project-specific configuration is needed.

The shared configuration ensures consistent code style across all projects in the monorepo.

## Limitations

- Only works with GitHub repositories (source)
- Destination must be accessible without interactive authentication (use SSH keys or HTTPS with credentials)
- Mirror cloning requires sufficient disk space for large repositories
- Deletion from GitHub is permanent and cannot be undone

## License

This is a research experiment in the agent-experiments repository. All artifacts are AI-generated.

## Contributing

This is a research project. See the main repository README for contribution guidelines.
