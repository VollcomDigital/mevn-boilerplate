# Contributing to MEVN Cloud Native Monorepo

First off, thank you for considering contributing to this project! This document provides guidelines and workflows for contributing.

## Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the behavior
- **Expected behavior** vs actual behavior
- **Environment details** (Node.js version, OS, etc.)
- **Code samples** or screenshots if applicable

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title and description** of the suggested feature
- **Use case** explaining why this would be useful
- **Possible implementation** approach (if you have ideas)

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Follow the development workflow** outlined below
3. **Write clear commit messages** following conventional commits
4. **Ensure tests pass** and linting is clean
5. **Update documentation** as needed
6. **Submit the pull request** with a clear description

## Development Workflow

### Prerequisites

- **Node.js** 22.x or higher
- **pnpm** 9.x or higher
- **Git**

### Setup

```bash
# Clone the repository
git clone https://github.com/VollcomDigital/mevn-boilerplate.git
cd mevn-boilerplate

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your local configuration

# Install git hooks
pnpm prepare
```

### Development Commands

```bash
# Run all apps in development mode
pnpm dev

# Build all packages
pnpm build

# Run linters
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format

# Run type checking
pnpm typecheck

# Clean build artifacts
pnpm clean
```

### Working on Specific Apps

```bash
# API development
cd apps/api
pnpm dev

# Web development
cd apps/web
pnpm dev

# CMS development
cd apps/cms
pnpm develop
```

## Coding Standards

### TypeScript

- Use **strict TypeScript** configuration
- Provide **type annotations** for function parameters and return types
- Avoid `any` type unless absolutely necessary
- Use **interfaces** for object shapes

### Code Style

- Follow **Prettier** configuration (enforced by pre-commit hooks)
- Follow **ESLint** rules (strict TypeScript rules enabled)
- Use **2 spaces** for indentation
- Use **LF** line endings
- Maximum line length: **100 characters**

### Naming Conventions

- **Variables/Functions**: `camelCase`
- **Types/Interfaces**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Files**: `kebab-case.ts` or `PascalCase.tsx` for components

### Documentation

- Add **JSDoc comments** for public functions and complex logic
- Include **Args**, **Returns**, and **Raises** sections
- Document **Time Complexity** for performance-critical functions
- Update **README.md** for significant feature additions

### Git Commit Messages

We follow **Conventional Commits** specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring without functionality change
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system or dependency changes
- `ci`: CI/CD configuration changes
- `chore`: Maintenance tasks

**Examples:**

```bash
feat(api): add rate limiting middleware

Implements express-rate-limit with configurable thresholds
for general API endpoints and stricter limits for auth routes.

Closes #123

fix(web): resolve hydration mismatch in header component

perf(api): optimize database query with indexed lookup

docs: update deployment guide with Kubernetes secrets
```

### Pre-commit Hooks

Pre-commit hooks automatically run:

1. **ESLint** on staged TypeScript/JavaScript files
2. **Prettier** formatting on all staged files
3. **Type checking** on TypeScript files

If hooks fail, fix the issues before committing.

## Testing

### Writing Tests

- Place test files next to the code they test: `module.test.ts`
- Use descriptive test names: `it('should return 404 when route not found')`
- Test edge cases and error conditions
- Mock external dependencies

### Running Tests

```bash
# Run all tests (when implemented)
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

## Security

### Reporting Security Vulnerabilities

**Do not report security vulnerabilities through public GitHub issues.**

Please refer to [SECURITY.md](./SECURITY.md) for our security policy and how to report vulnerabilities.

### Security Best Practices

- **Never commit secrets** or credentials
- Use **environment variables** for configuration
- Validate and sanitize **all user inputs**
- Use **prepared statements** for database queries
- Keep **dependencies up to date**
- Follow **OWASP** security guidelines

## Pull Request Process

1. **Update documentation** if you change APIs or add features
2. **Add tests** for new functionality
3. **Ensure CI passes** (linting, type checking, tests, builds)
4. **Request review** from at least one maintainer
5. **Address feedback** promptly and professionally
6. **Squash commits** if requested before merging

### PR Checklist

- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings or errors
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

## Project Structure

```
.
├── apps/
│   ├── api/          # Express 5 REST API
│   ├── web/          # Nuxt 4 SSR frontend
│   └── cms/          # Strapi 5 headless CMS
├── packages/
│   └── shared/       # Shared utilities and types
├── deploy/
│   └── k8s/          # Kubernetes Helm charts
├── .github/
│   └── workflows/    # CI/CD pipelines
└── docs/             # Additional documentation
```

## Questions?

If you have questions, feel free to:

- Open a **GitHub Discussion**
- Create an **issue** with the `question` label
- Reach out to maintainers directly

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🎉
