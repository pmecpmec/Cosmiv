# GitHub Actions Workflows

This directory contains all CI/CD workflows for the Cosmiv project.

## Workflow Overview

### Main Workflows

- **`ci.yml`** - Main CI/CD pipeline
  - Runs on pushes and pull requests
  - Tests, lints, builds, and conditionally deploys
  - Uses reusable workflows for modularity

- **`security.yml`** - Security scanning
  - Dependency vulnerability scanning
  - Secret scanning (Gitleaks)
  - CodeQL analysis
  - Runs weekly and on PRs

- **`release.yml`** - Release automation
  - Creates GitHub releases from version tags
  - Builds and tags Docker images
  - Generates changelogs

### Reusable Workflows

- **`reusable-python-tests.yml`** - Python backend testing
- **`reusable-python-lint.yml`** - Python code quality checks
- **`reusable-node-build.yml`** - Node.js frontend builds

### Supporting Workflows

- **`dependabot-auto-merge.yml`** - Auto-merge Dependabot PRs
- **`deploy-pages.yml`** - Frontend deployment to GitHub Pages

## Workflow Triggers

### CI Pipeline (`ci.yml`)
- **Push** to `main`, `master`, or `develop`
- **Pull Request** to `main` or `master`
- **Manual** via `workflow_dispatch`

### Security Scanning (`security.yml`)
- **Weekly** (Monday 00:00 UTC)
- **Push** to `main` or `master`
- **Pull Request** to `main` or `master`
- **Manual** via `workflow_dispatch`

### Release (`release.yml`)
- **Tag push** matching `v*.*.*`
- **Manual** with version input

## Required Secrets

### Repository Secrets

- `CODECOV_TOKEN` - (Optional) Codecov token for coverage uploads
- `BACKEND_URL` - (Optional) Backend production URL for health checks
- `CUSTOM_DOMAIN` - (Optional) Custom domain for GitHub Pages

### Platform-Specific Deployment Secrets

Configure these based on your deployment platform:

- **Railway**: `RAILWAY_TOKEN`
- **Render**: `RENDER_API_KEY`
- **Fly.io**: `FLY_API_TOKEN`
- **AWS**: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- **Kubernetes**: `KUBECONFIG`

## Environment Protection

The `production` environment is protected and requires:
- Manual approval (if configured)
- Successful CI pipeline
- No failing security scans

## Caching Strategy

- **Node.js**: npm cache based on `package-lock.json`
- **Python**: pip cache based on `requirements.txt`
- **Docker**: GitHub Actions cache for layer caching
- **Build artifacts**: Stored for 7 days

## Performance Optimizations

1. **Parallel Execution**: Tests and linting run in parallel
2. **Conditional Execution**: Jobs skip on path changes
3. **Matrix Builds**: Test multiple Python/Node versions
4. **Dependency Caching**: Aggressive caching of dependencies
5. **Artifact Reuse**: Build artifacts shared between jobs

## Best Practices

1. **Least Privilege**: Minimal permissions per job
2. **Fail Fast**: Critical jobs fail early
3. **Security First**: Security scans run on every PR
4. **Documentation**: All workflows are commented
5. **Reusability**: Common tasks in reusable workflows

## Troubleshooting

### Workflow Fails

1. Check job logs in Actions tab
2. Verify secrets are configured
3. Check environment protection rules
4. Review dependency cache issues

### Slow Workflows

1. Enable dependency caching
2. Use matrix builds for parallelization
3. Optimize Docker layer caching
4. Review artifact retention policies

### Deployment Issues

1. Verify environment secrets
2. Check deployment platform status
3. Review health check endpoints
4. Check database migration status

## Future Improvements

- [ ] Add performance benchmarking
- [ ] Implement canary deployments
- [ ] Add E2E testing workflow
- [ ] Set up staging environment
- [ ] Add rollback automation
- [ ] Implement feature flags

