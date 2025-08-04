# NuxtAuth

A comprehensive authentication system built with Nuxt 3, featuring both web authentication and PowerShell automation tools for bulk user management.

## Features

### Web Application
- Nuxt 3 based authentication system
- User management interface
- Organization and platform administration

### PowerShell Automation Tools
- **Optimized Bulk User Disable Script**: Efficiently process 63,000+ users
- **Performance Optimized**: Handles large datasets with minimal system resources
- **Microsoft Graph Integration**: Secure Azure AD user management
- **Comprehensive Monitoring**: Real-time progress tracking and performance metrics

## PowerShell Tools

The `/scripts/powershell/` directory contains enterprise-grade PowerShell tools for bulk user operations:

- **`DisableUser_Optimized_Parallel.ps1`**: Main script for bulk user disable operations
- **`Install-Prerequisites.ps1`**: Automated module installation and system validation
- **`Test-DisableUserScript.ps1`**: Comprehensive validation testing
- **`Run-UserDisableScript.bat`**: Interactive launcher with preset configurations

### Quick Start for PowerShell Tools
```powershell
# Navigate to PowerShell tools
cd scripts/powershell

# Install prerequisites
.\Install-Prerequisites.ps1

# Process users (example for large datasets)
.\DisableUser_Optimized_Parallel.ps1 -CsvPath "users.csv" -BatchSize 500 -MaxThreads 12
```

For detailed PowerShell documentation, see [scripts/POWERSHELL_README.md](scripts/POWERSHELL_README.md)

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
