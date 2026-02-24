# LumiMeds Next.js Frontend

This is the Next.js frontend application for LumiMeds, built with React, TypeScript, and Next.js 15.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Package Manager](#package-manager)
- [Environment Setup](#environment-setup)
- [Git Flow & Branching Strategy](#git-flow--branching-strategy)
- [Development Workflow](#development-workflow)
- [QA & Testing Process](#qa--testing-process)
- [Pre-Push Hooks](#pre-push-hooks)
- [Important Development Notes](#important-development-notes)

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20
- pnpm >= 8 (see [Package Manager](#package-manager) section)

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

---

## 📦 Package Manager

**We use `pnpm` instead of `npm` or `yarn`.**

### Install pnpm

```bash
# Using npm
npm install -g pnpm

# Using Homebrew (macOS)
brew install pnpm

# Using curl
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

### Common pnpm Commands

```bash
# Install dependencies
pnpm install

# Add a dependency
pnpm add <package-name>

# Add a dev dependency
pnpm add -D <package-name>

# Run scripts
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript type check
```

**Note:** Always use `pnpm` commands instead of `npm` or `yarn`.

---

## 🔧 Environment Setup

### 1. Create `.env.local` File

Copy the example file and configure your environment variables:

```bash
cp .env.example .env.local
```

### 2. Required Environment Variables

Edit `.env.local` with your configuration. See `.env.example` for all available variables.

**Important Notes:**
- `NEXT_PUBLIC_ENCRYPTION_KEY` and `NEXT_PUBLIC_ENCRYPTION_SALT` are **shared across all environments** (dev, staging, production) - **use the same values everywhere**
  - These are used for client-side encryption of localStorage data
  - Changing these values will break encryption/decryption of existing data
  - Get the actual values from your team or DevOps
- All other variables should be environment-specific

### 3. Key Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://api-staging.lumimeds.com/api` |
| `NEXT_PUBLIC_SITE_URL` | Frontend site URL | `http://localhost:3000` |
| `NEXT_PUBLIC_ENV` | Environment name | `development`, `staging`, `production` |
| `NEXT_PUBLIC_ENCRYPTION_KEY` | Encryption key (shared) | `your-encryption-key-here` |
| `NEXT_PUBLIC_ENCRYPTION_SALT` | Encryption salt (shared) | `lumimeds-salt-2024` |
| `NEXT_PUBLIC_HUBSPOT_PORTAL_ID` | HubSpot tracking ID | `244175540` |
| `NEXT_PUBLIC_ALLOW_INDEXING` | SEO indexing control | `false` (dev/staging), `true` (production) |

See `.env.example` for the complete list of environment variables.

---

## 🌿 Git Flow & Branching Strategy

### Branch Structure

```
main (production)
  └── pre-release (staging) ← Always fork from here for features
      └── feature/enhancement branches
```

### Branch Naming Convention

- **Features/Enhancements**: `feat/[ticket-id]` or `enh/[ticket-id]`
  - Example: `feat/COC-1234`, `enh/COC-5678`
- **Hotfixes**: `hotfix/[ticket-id]`
  - Example: `hotfix/COC-9999`

### Branching Rules

1. **`main` branch**: Production deployment only
2. **`pre-release` branch**: Staging deployment (replica of main)
3. **Always fork from `pre-release`** for features/enhancements
4. **Fork from `main`** only for hotfixes

### Creating a New Branch

#### For Features/Enhancements

```bash
# 1. Fetch latest changes
git fetch origin

# 2. Checkout pre-release
git checkout pre-release

# 3. Pull latest changes
git pull origin pre-release

# 4. Create and checkout new feature branch
git checkout -b feat/COC-1234
# or
git checkout -b enh/COC-1234
```

#### For Hotfixes

```bash
# 1. Fetch latest changes
git fetch origin

# 2. Checkout main
git checkout main

# 3. Pull latest changes
git pull origin main

# 4. Create and checkout new hotfix branch
git checkout -b hotfix/COC-9999
```

### Keeping Your Branch Updated

```bash
# While working on your feature branch
git checkout feat/COC-1234

# Fetch latest changes
git fetch origin

# Merge latest pre-release into your branch
git merge origin/pre-release

# Resolve any conflicts if needed
# Then push your changes
git push origin feat/COC-1234
```

---

## 🔄 Development Workflow

### 1. Start Development

```bash
# Install dependencies (if not done)
pnpm install

# Start dev server
pnpm dev
```

### 2. Make Your Changes

- Write your code
- Follow TypeScript and ESLint rules
- Test locally

### 3. Before Committing

```bash
# Run linting
pnpm lint

# Run type check
pnpm type-check

# Fix formatting (if needed)
pnpm format
```

### 4. Commit and Push

```bash
# Stage your changes
git add .

# Commit with descriptive message
git commit -m "feat(COC-1234): Add new feature"

# Push to your branch
git push origin feat/COC-1234
```

**Note:** Pre-push hooks will automatically run checks (see [Pre-Push Hooks](#pre-push-hooks)).

---

## 🧪 QA & Testing Process

### 1. Prepare Your PR

When your ticket is ready for QA:

1. **Ensure your branch is up to date:**
   ```bash
   git checkout feat/COC-1234
   git fetch origin
   git merge origin/pre-release
   git push origin feat/COC-1234
   ```

2. **Create Pull Request:**
   - Go to GitHub and create a PR against `pre-release`
   - **Important:** Include the Linear ticket ID in the PR title
   - Example: `[COC-1234] Add new feature`

3. **Wait for PR to be created** (GitHub will show the PR number)

### 2. Trigger QA Preview Deployment

1. Go to: https://github.com/Lumimeds/lumimeds-nextjs/actions/workflows/qa-preview-deploy.yml

2. Click **"Run Workflow"** button

3. Enter your **PR number** in the input field

4. **Leave these fields unchanged** (unless you need to override):
   - `frontend` override: Leave empty
   - `backend` override: Leave empty
   
   **Note:** Override fields are only used if a PR is missing and you want to test using a specific branch manually.

5. Click **"Run workflow"**

### 3. Preview Environment

Once the workflow completes:

- **Preview URLs will be posted on your PR** automatically
- You can also find them in the workflow run details under "Checks"
- Check Slack channel `#lumimeds-dev-staging-deployments` for deployment notifications

**Example Slack message:**
```
🚀 Preview deployment completed for PR #123
Frontend: https://pr-123-frontend.amplifyapp.com
Backend: https://pr-123-backend.ecs.amazonaws.com
```

### 4. QA Testing

- **QA will test** your changes on the preview environment
- **QA will share feedback** or approve the PR

#### If QA Requests Changes:

1. Make the requested changes
2. Push to the **same branch** (no need to create a new PR)
3. Once QA receives the updated ticket, **trigger the workflow again** with the same PR number
4. The preview environment will be updated automatically

#### If QA Approves:

- PR will be merged into `pre-release`
- Changes will be deployed to staging
- After staging validation, changes will be merged to `main` for production

### 5. Debugging Preview Deployments

**Sometimes Amplify building takes time** - the portal might take 4-5 minutes to load on the Amplify URLs.

**If preview doesn't load:**
1. Wait 5-10 minutes for build to complete
2. Check the GitHub Actions workflow for build status
3. Check Slack channel for deployment status
4. Verify the PR number is correct

---

## 🔒 Pre-Push Hooks

This project uses [Husky](https://typicode.github.io/husky/) to run automated checks before pushing code.

### What Gets Checked

When you run `git push`, the following checks are automatically performed:

#### Required Checks (Block Push if Failed)
1. **ESLint** - Linting errors and warnings
2. **TypeScript Type Check** - Type errors and inconsistencies
3. **Prettier Format Check** - Code formatting (only checks changed files)
4. **Code Quality Check** - Detects:
   - `console.log`, `console.debug`, `console.info` statements
   - `debugger` statements
   - Only checks changed/staged files, not entire codebase
   - **Note:** `console.error` and `console.warn` are allowed for error handling

#### Optional Checks
5. **Build Check** - Full production build (disabled by default, can be slow)

### Usage

#### Normal Push
```bash
git push
```
Runs all required checks (ESLint + TypeScript + Prettier + Code Quality).

#### Skip Prettier Check
```bash
SKIP_PRETTIER=true git push
```

#### Skip Code Quality Check
```bash
SKIP_CODE_QUALITY=true git push
```

#### Enable Build Check
```bash
RUN_BUILD=true git push
```

#### Skip All Hooks (Not Recommended)
```bash
git push --no-verify
```
Bypasses all pre-push checks. Use only in emergencies.

### Manual Checks

You can also run these checks manually:

```bash
# Run ESLint
pnpm lint

# Run TypeScript type check
pnpm type-check

# Check code formatting
pnpm format:check

# Auto-fix formatting issues
pnpm format

# Run code quality check
pnpm check-code-quality

# Run production build
pnpm build
```

### Handling Issues

#### Prettier Formatting Issues
```bash
# Auto-fix all formatting issues
pnpm format
```

#### Code Quality Issues
If the code quality check finds `console.log` statements:

1. **Remove them** - Best practice for production code
2. **Use proper logging** - Replace with `console.error` or `console.warn` for error handling
3. **Temporarily allow** - Add `// eslint-disable-next-line` above the line if needed

Example:
```typescript
// eslint-disable-next-line
console.log('Debug info'); // Will be ignored by code quality check
```

### Important Notes

- **Hooks only run on `git push`** - They do NOT interfere with `pnpm dev` or other development processes
- **Only changed files are checked** - Existing code issues won't block your push
- **All checks can be skipped** - Use environment variables or `--no-verify` if needed

---

## 💡 Important Development Notes

### Project Structure

- **`src/app/`** - Next.js App Router pages and routes
- **`src/components/`** - React components
- **`src/lib/`** - Utility functions and helpers
- **`src/store/`** - Redux store and slices
- **`src/types/`** - TypeScript type definitions
- **`src/constants/`** - Application constants

### Key Technologies

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Redux Toolkit** - State management
- **Tailwind CSS** - Utility-first CSS framework
- **next-intl** - Internationalization (i18n)
- **Axios** - HTTP client for API calls

### Important Files

- **`next.config.ts`** - Next.js configuration
- **`middleware.ts`** - Authentication and routing middleware
- **`src/lib/encryption.ts`** - Client-side encryption utilities
- **`src/lib/baseQuery.ts`** - API base query configuration

### Development Best Practices

1. **Always use TypeScript** - No `any` types unless absolutely necessary
2. **Follow ESLint rules** - Fix linting errors before committing
3. **Write descriptive commit messages** - Include ticket ID when applicable
4. **Test locally** - Verify your changes work before pushing
5. **Keep branches updated** - Regularly merge `pre-release` into your feature branch

### Common Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm type-check       # TypeScript type check
pnpm format           # Auto-fix formatting
pnpm check-code-quality  # Check for console.log, debugger, etc.

# Git
git fetch origin                    # Fetch latest changes
git checkout pre-release            # Switch to pre-release
git pull origin pre-release         # Update pre-release
git checkout -b feat/COC-1234        # Create feature branch
```

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs) - Next.js features and API
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - TypeScript documentation
- [Redux Toolkit Docs](https://redux-toolkit.js.org/) - Redux Toolkit guide
- [Tailwind CSS Docs](https://tailwindcss.com/docs) - Tailwind CSS documentation

### Project-Specific Documentation

- `docs/ENVIRONMENT_SETUP.md` - Detailed environment variable setup
- `docs/HUBSPOT_QUICK_SETUP.md` - HubSpot integration guide
- `docs/TRUSTPILOT_SETUP.md` - Trustpilot integration guide

---

## 🆘 Troubleshooting

### Build Errors

```bash
# Clean build cache
pnpm build:clean

# Low memory build
pnpm build:low-memory
```

### Environment Variable Issues

- Ensure `.env.local` exists and has all required variables
- Check that `NEXT_PUBLIC_*` variables are set (they're exposed to the browser)
- Restart dev server after changing `.env.local`

### Git Issues

```bash
# If pre-push hooks fail
SKIP_PRETTIER=true git push        # Skip prettier
SKIP_CODE_QUALITY=true git push   # Skip code quality
git push --no-verify              # Skip all (emergency only)
```

### Preview Deployment Issues

- Wait 5-10 minutes for Amplify build to complete
- Check GitHub Actions workflow status
- Verify PR number is correct
- Check Slack channel for deployment status

---

## 🎯 Quick Reference

| Task | Command |
|------|---------|
| Install dependencies | `pnpm install` |
| Start dev server | `pnpm dev` |
| Create feature branch | `git checkout -b feat/COC-1234` |
| Update from pre-release | `git merge origin/pre-release` |
| Run linting | `pnpm lint` |
| Type check | `pnpm type-check` |
| Format code | `pnpm format` |

---

**Happy Coding! 🚀**
