# MyOwnLeague — Production Deployment Guide

This folder contains deployment architecture, CI/CD, container images, Kubernetes manifests, and operational runbooks for **mol-backend** (Spring Boot) and **mol-frontend** (Vite/React PWA).

## Quick links

| Document | Purpose |
|----------|---------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Infrastructure topology, scaling, HA |
| [WORKFLOW.md](./WORKFLOW.md) | Branching, releases, rollback |
| [MONITORING.md](./MONITORING.md) | Logs, metrics, alerts, SLOs |
| [CHECKLIST.md](./CHECKLIST.md) | Pre/post deploy gates |

## Repository layout

```
mol-backend/          Spring Boot API + STOMP (/ws/game)
mol-frontend/       Static SPA (nginx in prod)
deploy/
  docker/           docker-compose.prod.yml
  kubernetes/       K8s manifests (GKE/EKS/AKS compatible)
.github/workflows/  CI + CD pipelines
```

## Local production-like stack

```bash
# From repo root — build images first
docker build -t mol-backend:local ./mol-backend
docker build -t mol-frontend:local ./mol-frontend

docker compose -f deploy/docker/docker-compose.prod.yml up -d
```

Set secrets in `deploy/docker/.env` (copy from `.env.example`).

## Critical constraint: WebSocket scaling

The backend uses Spring’s **in-memory simple broker** (`WebSocketConfig`). Game state lives in **Redis**, but STOMP topic fan-out is per JVM.

| Scale stage | Approach |
|-------------|----------|
| **MVP prod** | 1 backend replica + sticky ingress (manifests include affinity) |
| **Growth** | Enable **Redis STOMP relay** or external broker (RabbitMQ) so multiple API pods share `/topic` |
| **High traffic** | Separate WS gateway service; keep REST stateless |

Do not run multiple backend replicas without solving broker affinity — players on different pods will not receive each other’s events.

## Recommended cloud baseline (cost-conscious)

| Layer | Service examples |
|-------|------------------|
| Frontend | CloudFront + S3, or nginx behind ALB |
| API | ECS Fargate / Cloud Run / K8s Deployment |
| PostgreSQL | RDS / Cloud SQL / Azure Database (Multi-AZ) |
| Redis | ElastiCache / Memorystore (replication enabled) |
| Secrets | AWS Secrets Manager / GCP Secret Manager |
| TLS | ACM / cert-manager + Let’s Encrypt |
| CI/CD | GitHub Actions → ECR/GCR → deploy |

## Environment variables

### Backend (`mol-backend`)

| Variable | Required | Description |
|----------|----------|-------------|
| `SPRING_PROFILES_ACTIVE` | prod | Activates `application-prod.properties` |
| `JWT_SECRET` | yes | ≥32 chars; never commit |
| `SPRING_DATASOURCE_URL` | yes | JDBC URL to PostgreSQL |
| `SPRING_DATASOURCE_USERNAME` | yes | DB user |
| `SPRING_DATASOURCE_PASSWORD` | yes | From secret store |
| `SPRING_DATA_REDIS_HOST` | yes | Redis hostname |
| `SPRING_DATA_REDIS_PORT` | default 6379 | |
| `SPRING_DATA_REDIS_USERNAME` | if ACL | e.g. Aiven `default` |
| `SPRING_DATA_REDIS_PASSWORD` | if auth | |
| `SPRING_DATA_REDIS_SSL_ENABLED` | managed Redis | `true` for Aiven/ElastiCache TLS |
| `MOL_CORS_ALLOWED_ORIGINS` | yes | Comma-separated frontend origins |

### Frontend (build-time)

| Variable | Example |
|----------|---------|
| `VITE_API_BASE_URL` | `https://api.myownleague.example` |
| `VITE_WS_URL` | `wss://api.myownleague.example/ws/game` |

## Next implementation steps (code)

1. Add `spring-boot-starter-actuator` + expose `/actuator/health` (see `application-prod.properties`).
2. Replace `ddl-auto=update` with **Flyway** migrations before first prod deploy.
3. Tighten `WebSocketConfig` CORS to `MOL_CORS_ALLOWED_ORIGINS`.
4. Implement Redis STOMP relay before scaling API > 1 replica.
5. Add rate limiting (Bucket4j / API gateway) on `/api/v1/auth/**` and room join.
