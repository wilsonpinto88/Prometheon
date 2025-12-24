# Development Procedures

## Git Workflow

### Branch Strategy

We use **Git Flow** with the following branches:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Feature development branches
- `bugfix/*` - Bug fix branches
- `hotfix/*` - Critical production fixes

### Branch Naming Convention

```
feature/dashboard-stats
feature/sacred-texts-filtering
bugfix/task-progress-calculation
hotfix/auth-token-expiry
```

### Commit Message Convention

We follow **Conventional Commits**:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(dashboard): add realm progress component
fix(tasks): correct progress calculation logic
docs(architecture): update state management section
style(ui): format button component
refactor(api): simplify service layer
test(progress): add unit tests for progress hooks
chore(deps): update React to 18.2.0
```

### Pull Request Process

1. **Create PR** from feature branch to `develop`
2. **PR Title**: Follow commit message convention
3. **PR Description**: 
   - What changes were made
   - Why the changes were made
   - Screenshots (if UI changes)
   - Testing instructions
4. **Code Review**: At least one approval required
5. **Merge**: Squash and merge (preferred) or rebase

---

## Development Workflow

### Starting a New Feature

1. **Create Feature Branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/feature-name
   ```

2. **Set Up Local Environment**
   ```bash
   pnpm install
   pnpm dev
   ```

3. **Create Feature Files**
   - Follow the architecture structure
   - Create components, hooks, services as needed

4. **Write Tests**
   - Unit tests for utilities
   - Component tests for UI
   - Integration tests for features

5. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat(feature): implement feature name"
   ```

6. **Push and Create PR**
   ```bash
   git push origin feature/feature-name
   ```

### Code Review Checklist

- [ ] Code follows TypeScript conventions
- [ ] Components are properly typed
- [ ] No console.logs or debug code
- [ ] Tests are written and passing
- [ ] No linter errors
- [ ] Code is properly formatted (Prettier)
- [ ] Accessibility considerations addressed
- [ ] Performance implications considered
- [ ] Documentation updated if needed

---

## Testing Procedures

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e
```

### Test Coverage Requirements

- **Minimum Coverage**: 80% for utilities and hooks
- **Component Tests**: All user-facing components
- **Integration Tests**: Critical user flows
- **E2E Tests**: Main user journeys

### Writing Tests

1. **Unit Tests**: Test individual functions/hooks
2. **Component Tests**: Test component rendering and interactions
3. **Integration Tests**: Test feature workflows
4. **E2E Tests**: Test complete user scenarios

---

## Code Quality Procedures

### Linting

```bash
# Check for linting errors
pnpm lint

# Auto-fix linting errors
pnpm lint:fix
```

### Formatting

```bash
# Check formatting
pnpm format:check

# Format code
pnpm format
```

### Pre-commit Hooks

Husky runs automatically on commit:
- ESLint checks
- Prettier formatting
- Type checking
- Test execution (staged files only)

---

## Documentation Procedures

### Code Documentation

1. **JSDoc Comments**: For functions and complex logic
   ```typescript
   /**
    * Calculates user progress across all realms
    * @param userId - The user's unique identifier
    * @returns Progress data with completion percentages
    */
   export const calculateRealmProgress = (userId: string): RealmProgress => {
     // ...
   }
   ```

2. **Component Documentation**: README in component folder
3. **API Documentation**: Document service methods
4. **Type Documentation**: Document complex types

### Updating Documentation

- Update docs when adding new features
- Keep architecture docs current
- Document breaking changes
- Update README with setup instructions

---

## Environment Setup

### Required Tools

- Node.js 18+ (LTS)
- pnpm 8+ (or npm/yarn)
- Git
- VS Code (recommended)

### Initial Setup

```bash
# Clone repository
git clone <repository-url>
cd Prometheon

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Start development server
pnpm dev
```

### Environment Variables

- `.env` - Local development (gitignored)
- `.env.example` - Template for environment variables
- `.env.production` - Production variables (secure storage)

---

## Debugging Procedures

### Development Tools

1. **React DevTools**: Component inspection
2. **Redux DevTools**: State inspection (if using Redux)
3. **Browser DevTools**: Network, console, performance
4. **VS Code Debugger**: Breakpoint debugging

### Common Debugging Steps

1. Check browser console for errors
2. Inspect network requests
3. Check component state in React DevTools
4. Verify API responses
5. Check localStorage/sessionStorage
6. Review application logs

---

## Performance Monitoring

### Performance Metrics

- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.8s
- **Cumulative Layout Shift (CLS)**: < 0.1

### Performance Testing

```bash
# Build for production
pnpm build

# Analyze bundle size
pnpm analyze

# Lighthouse audit
# Use Chrome DevTools Lighthouse tab
```

---

## Release Procedures

### Versioning

We follow **Semantic Versioning** (SemVer):
- `MAJOR.MINOR.PATCH` (e.g., 1.2.3)
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Release Process

1. **Update Version**
   ```bash
   # Update package.json version
   npm version patch|minor|major
   ```

2. **Create Release Notes**
   - List new features
   - List bug fixes
   - List breaking changes

3. **Create Release Tag**
   ```bash
   git tag -a v1.2.3 -m "Release v1.2.3"
   git push origin v1.2.3
   ```

4. **Deploy to Production**
   - Automated via CI/CD
   - Manual deployment if needed

---

## Troubleshooting

### Common Issues

1. **Dependencies Out of Sync**
   ```bash
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

2. **TypeScript Errors**
   ```bash
   pnpm type-check
   ```

3. **Build Failures**
   - Check Node version
   - Clear build cache
   - Check environment variables

4. **Port Already in Use**
   ```bash
   # Change port in vite.config.ts or .env
   ```

---

## Communication

### Daily Standups
- What you worked on
- What you're working on
- Any blockers

### Code Reviews
- Be constructive and respectful
- Explain reasoning for suggestions
- Respond to feedback promptly

### Documentation
- Keep docs up to date
- Ask questions if unclear
- Share knowledge with team

---

## Best Practices

1. **Write Self-Documenting Code**: Clear variable/function names
2. **Keep Functions Small**: Single responsibility
3. **Avoid Premature Optimization**: Profile first
4. **Test Edge Cases**: Not just happy paths
5. **Review Your Own Code**: Before requesting review
6. **Stay Updated**: Keep dependencies current
7. **Follow Patterns**: Consistency across codebase

