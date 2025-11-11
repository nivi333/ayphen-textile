# CI/CD Pipeline Setup Guide

This document provides comprehensive instructions for setting up and managing the CI/CD pipeline for the Lavoro AI Ferri textile manufacturing ERP system.

## Table of Contents

1. [Overview](#overview)
2. [GitHub Actions Workflows](#github-actions-workflows)
3. [Docker Configuration](#docker-configuration)
4. [Kubernetes Deployment](#kubernetes-deployment)
5. [Database Backup & Migration](#database-backup--migration)
6. [Environment Configuration](#environment-configuration)
7. [Monitoring & Logging](#monitoring--logging)
8. [Security Considerations](#security-considerations)
9. [Troubleshooting](#troubleshooting)

## Overview

The CI/CD pipeline is designed with the following principles:
- **Multi-environment support**: Development, Staging, Production
- **Security-first approach**: Vulnerability scanning, secret management
- **Database safety**: Automated backups before deployments
- **Zero-downtime deployments**: Blue-green deployment strategy
- **Comprehensive testing**: Unit, integration, E2E, and performance tests
- **Monitoring & observability**: Health checks, metrics, and logging

## GitHub Actions Workflows

### Continuous Integration (`.github/workflows/ci.yml`)

Triggered on push to `main` and `develop` branches, and on pull requests.

#### Jobs:
1. **Lint & Code Quality**
   - ESLint validation
   - Prettier formatting check
   - TypeScript type checking

2. **Unit & Integration Tests**
   - PostgreSQL and Redis services
   - Prisma client generation
   - Database migrations
   - Test execution with coverage

3. **Security Audit**
   - npm audit for vulnerabilities
   - Snyk security scanning

4. **Build & Docker Image**
   - Application build
   - Docker image creation
   - Trivy vulnerability scanning

5. **Database Migration Check**
   - Migration status validation
   - Schema validation
   - Seed data testing

6. **Performance Tests**
   - Load testing (main branch only)
   - Performance metrics collection

### Deployment Pipeline (`.github/workflows/deploy.yml`)

Handles environment-specific deployments based on branch:
- `main` → Production
- `develop` → Staging
- `release/*` → Staging

#### Jobs:
1. **Environment Determination**
   - Automatic environment detection
   - Manual deployment support

2. **Docker Image Build & Push**
   - Multi-stage Docker build
   - Container registry push
   - Image vulnerability scanning

3. **Environment-Specific Deployment**
   - **Development**: Simple deployment
   - **Staging**: Rolling update with health checks
   - **Production**: Blue-green deployment with smoke tests

4. **Database Migration**
   - Pre-deployment backup
   - Migration execution
   - Schema validation

5. **Post-Deployment Tests**
   - End-to-end testing
   - API validation
   - Health check verification

6. **Notification & Release**
   - Slack notifications
   - GitHub release creation (production)

## Docker Configuration

### Multi-Stage Dockerfile

The `Dockerfile` uses a multi-stage build approach:

```dockerfile
# Stage 1: Builder
FROM node:20-alpine AS builder
# Dependencies installation and build

# Stage 2: Production
FROM node:20-alpine AS production
# Minimal runtime image with security hardening
```

#### Security Features:
- Non-root user execution
- Minimal base image (Alpine)
- Security scanning integration
- Health check configuration

### Docker Compose

The `docker-compose.yml` provides:
- **Development environment**: Full stack with hot reload
- **Testing environment**: Isolated test databases
- **Monitoring stack**: Prometheus, Grafana, ELK
- **Production-like setup**: Nginx reverse proxy

#### Profiles:
- `default`: Basic development stack
- `test`: Testing environment
- `monitoring`: Observability stack
- `logging`: ELK stack
- `production`: Production-like setup

## Kubernetes Deployment

### Base Configuration (`k8s/base/`)

- **Deployment**: Application pods with health checks
- **Service**: ClusterIP and headless services
- **ConfigMap**: Environment-specific configuration
- **CronJobs**: Automated maintenance tasks

### Environment Overlays

#### Staging (`k8s/overlays/staging/`)
- 2 replicas
- Debug logging
- Relaxed rate limiting
- Staging-specific secrets

#### Production (`k8s/overlays/production/`)
- 3+ replicas with HPA
- Optimized resource limits
- Production logging
- Blue-green deployment support

### Deployment Commands

```bash
# Staging deployment
kubectl apply -k k8s/overlays/staging

# Production deployment
kubectl apply -k k8s/overlays/production

# Check deployment status
kubectl rollout status deployment/lavoro-backend -n production
```

## Database Backup & Migration

### Automated Backup Script (`scripts/backup-database.sh`)

Features:
- **Multi-tenant aware**: Separate global and tenant backups
- **S3 integration**: Automatic cloud backup
- **Retention management**: Configurable cleanup
- **Compression**: Gzip compression for storage efficiency
- **Metadata generation**: Backup verification and tracking

#### Usage:
```bash
# Full database backup
./scripts/backup-database.sh full

# Separate global and tenant backups
./scripts/backup-database.sh separate

# Only tenant schemas
./scripts/backup-database.sh tenants

# With S3 upload
S3_BUCKET=my-backups ./scripts/backup-database.sh full
```

### Database Restore Script (`scripts/restore-database.sh`)

Features:
- **Selective restore**: Global, tenant, or full database
- **Pre-restore backup**: Safety backup before restore
- **S3 download**: Restore from cloud backups
- **Verification**: Backup integrity checks
- **Post-restore tasks**: Schema validation and client generation

#### Usage:
```bash
# List available backups
./scripts/restore-database.sh list-local
./scripts/restore-database.sh list-s3

# Restore full database
./scripts/restore-database.sh full backup_file.sql.gz

# Restore from S3
./scripts/restore-database.sh full s3://bucket/backup.sql.gz
```

### Kubernetes CronJobs

Automated maintenance tasks:
- **Daily backups**: 2 AM UTC
- **Migration checks**: Every 6 hours
- **Session cleanup**: Daily at 1 AM UTC

## Environment Configuration

### Required Secrets

#### GitHub Secrets:
```
DOCKER_USERNAME          # Docker Hub username
DOCKER_PASSWORD          # Docker Hub password
AWS_ACCESS_KEY_ID        # AWS access key
AWS_SECRET_ACCESS_KEY    # AWS secret key
AWS_REGION              # AWS region
EKS_CLUSTER_NAME_STAGING # Staging cluster name
EKS_CLUSTER_NAME_PRODUCTION # Production cluster name
SNYK_TOKEN              # Snyk security token
SLACK_WEBHOOK_URL       # Slack notifications
```

#### Kubernetes Secrets:
```
database-url            # PostgreSQL connection string
jwt-secret             # JWT signing secret
jwt-refresh-secret     # JWT refresh secret
s3-backup-bucket       # S3 backup bucket
aws-access-key-id      # AWS credentials
aws-secret-access-key  # AWS credentials
```

### Environment Variables

#### Application Configuration:
```bash
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
DATABASE_URL=postgresql://...
REDIS_HOST=redis-service
REDIS_PORT=6379
JWT_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
```

#### CI/CD Configuration:
```bash
# Backup settings
BACKUP_DIR=/app/backups
RETENTION_DAYS=30
S3_BUCKET=lavoro-backups
S3_PREFIX=database-backups

# Deployment settings
KUBE_CONFIG_DATA=base64-encoded-kubeconfig
```

## Monitoring & Logging

### Health Checks

Multiple health check endpoints:
- `/health` - Basic application health
- `/api/v1/health` - Detailed system health
- `/api/v1/health/database` - Database connectivity
- `/api/v1/health/redis` - Redis connectivity

### Prometheus Metrics

Application exposes metrics at `/metrics`:
- Request duration and count
- Database connection pool status
- Redis connection status
- Custom business metrics

### Logging Strategy

- **Structured logging**: JSON format with Winston
- **Request tracing**: Unique request IDs
- **Error tracking**: Comprehensive error context
- **Performance monitoring**: Response time tracking

### Grafana Dashboards

Pre-configured dashboards for:
- Application performance
- Database metrics
- Infrastructure monitoring
- Business KPIs

## Security Considerations

### Container Security

- **Non-root execution**: User ID 1001
- **Minimal attack surface**: Alpine base image
- **Vulnerability scanning**: Trivy integration
- **Secret management**: Kubernetes secrets

### Network Security

- **Service mesh ready**: Istio compatible
- **Network policies**: Pod-to-pod communication control
- **TLS termination**: Ingress-level SSL
- **Rate limiting**: Application and infrastructure level

### Access Control

- **RBAC**: Kubernetes role-based access
- **Service accounts**: Minimal privilege principle
- **Secret rotation**: Regular credential updates
- **Audit logging**: Comprehensive access logs

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check build logs
docker build --no-cache -t lavoro-ai-ferri/backend .

# Verify dependencies
npm audit
npm outdated
```

#### Deployment Issues
```bash
# Check pod status
kubectl get pods -n production -l app=lavoro-backend

# View logs
kubectl logs -f deployment/lavoro-backend -n production

# Check events
kubectl get events -n production --sort-by='.lastTimestamp'
```

#### Database Issues
```bash
# Check migration status
npm run db:migrate:status

# Validate schema
npm run db:validate

# Test connection
pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER
```

#### Backup/Restore Issues
```bash
# Verify backup integrity
gunzip -t backup_file.sql.gz

# Check S3 connectivity
aws s3 ls s3://your-backup-bucket/

# Test restore in staging
./scripts/restore-database.sh full backup_file.sql.gz
```

### Performance Optimization

#### Database Performance
- Connection pooling configuration
- Query optimization
- Index analysis
- Slow query monitoring

#### Application Performance
- Memory usage monitoring
- CPU utilization tracking
- Response time optimization
- Caching strategies

### Scaling Considerations

#### Horizontal Scaling
- HPA configuration
- Load balancing
- Session affinity
- Database connection limits

#### Vertical Scaling
- Resource limit tuning
- Memory optimization
- CPU allocation
- Storage requirements

## Best Practices

### Development Workflow
1. Feature branch creation
2. Local testing with Docker Compose
3. Pull request with CI validation
4. Code review and approval
5. Merge to develop for staging deployment
6. Production deployment via main branch

### Database Management
1. Always backup before migrations
2. Test migrations in staging first
3. Monitor migration performance
4. Validate schema after deployment
5. Keep backup retention policy updated

### Security Practices
1. Regular dependency updates
2. Security scanning in CI/CD
3. Secret rotation schedule
4. Access audit reviews
5. Vulnerability response plan

### Monitoring & Alerting
1. Set up critical alerts
2. Monitor key business metrics
3. Track performance trends
4. Regular health check reviews
5. Incident response procedures

## Support & Maintenance

### Regular Tasks
- Weekly dependency updates
- Monthly security reviews
- Quarterly performance analysis
- Annual disaster recovery testing

### Documentation Updates
- Keep deployment procedures current
- Update troubleshooting guides
- Maintain runbook accuracy
- Document configuration changes

### Team Training
- CI/CD pipeline understanding
- Kubernetes operations
- Database management
- Security best practices
- Incident response procedures
