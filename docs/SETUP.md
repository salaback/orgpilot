# Project Setup Guide

This document provides instructions for setting up the OrgPilot development environment.

## Local Development with Laravel Sail

OrgPilot uses [Laravel Sail](https://laravel.com/docs/sail), a light-weight command-line interface for interacting with Laravel's Docker development environment.

**Important:** When running commands locally, prefix them with `./vendor/bin/sail` instead of using PHP or Artisan directly:

```bash
# Instead of:
php artisan migrate

# Use:
./vendor/bin/sail artisan migrate
```

### Common Commands

- Start the development environment: `./vendor/bin/sail up`
- Start in detached mode: `./vendor/bin/sail up -d`
- Stop the environment: `./vendor/bin/sail down`
- Run tests: `./vendor/bin/sail test`

## Frontend Development

Frontend assets are managed with Vite. Use these commands via Sail:

```bash
# Run development server
./vendor/bin/sail npm run dev

# Build for production
./vendor/bin/sail npm run build
```

## Testing

The project uses PHPUnit for PHP tests. Run tests with:

```bash
./vendor/bin/sail test
```

## Code Style and Quality

- PHP code should follow PSR standards and can be formatted with Laravel Pint
- JavaScript/TypeScript code should follow the project's ESLint and Prettier configuration
- Run `./vendor/bin/sail npm run format` to format frontend code
- Run `./vendor/bin/sail npm run lint` to lint frontend code
