# Deployment Workflow

## Branching model (GitHub Flow)

```
main          ─── always deployable; protected
  ↑
feature/*     ─── PR → CI → review → merge
release/*     ─── optional; tag for prod promotion
```

| Branch | Deploys to | Approval |
|--------|------------|----------|
| `main` | Staging (auto) | CI green + 1 review |
| Tag `v*.*.*` | Production | Manual workflow dispatch or environment gate |
| `hotfix/*` | Prod via fast-track | Owner approval |

## Pipeline stages

```mermaid
flowchart LR
  A[Push / PR] --> B[CI: test + lint + build]
  B --> C{Branch?}
  C -->|PR| D[Report status]
  C -->|main| E[Build & push images]
  E --> F[Deploy staging]
  F --> G[Smoke tests]
  G --> H{Promote?}
  H -->|yes| I[Deploy production]
  I --> J[Post-deploy checks]
```

### CI (every PR and push to `main`)

1. **Backend**: `./mvnw -B verify` (unit + integration tests)
2. **Frontend**: `npm ci && npm run lint && npm run build`
3. **Optional**: Trivy scan on Dockerfiles (on `main` only)

### CD (on merge to `main`)

1. Build `mol-backend` and `mol-frontend` Docker images.
2. Tag: `sha-<short>`, `main-<run_number>`, and semver on release tags.
3. Push to container registry (GHCR/ECR/GCR).
4. Deploy to **staging** namespace/cluster.
5. Run smoke: `GET /actuator/health`, auth health, static frontend 200.

### Production promotion

- Trigger: GitHub **environment** `production` with required reviewers.
- Input: image digest or tag (immutable — never deploy `latest` alone).
- Strategy: **rolling update** (K8s) or **blue/green** (two deployments + ingress switch).

## Release process

1. Freeze: no unrelated merges during release window.
2. Create release branch or tag `v1.2.3` from `main`.
3. Run DB migrations (Flyway) **before** or as init job **before** new app pods take traffic.
4. Deploy backend → wait healthy → deploy frontend (API URL baked at build).
5. Monitor error rate and WS connect success for 30 minutes.
6. Document release in changelog; archive staging tag.

## Rollback

| Symptom | Action |
|---------|--------|
| 5xx spike after deploy | `kubectl rollout undo deployment/mol-backend` (and frontend) |
| Migration failure | Stop deploy; restore DB from snapshot if forward migration partial |
| WS broken | Check ingress timeouts + affinity; revert to last known good image |

Keep **previous image digest** in deployment annotations for one-click rollback.

## Configuration management

| Config | Where |
|--------|-------|
| Non-secret app config | K8s ConfigMap / SSM Parameter Store |
| Secrets | K8s Secret (Sealed Secrets / External Secrets Operator) |
| Frontend API URLs | CI build-args at image build time per environment |

## Downtime minimization

- **Readiness** probe must pass before Service receives traffic.
- **PreStop** hook: `sleep 15` on API to drain STOMP connections.
- Deploy during low-traffic window; use **PodDisruptionBudget** `minAvailable: 1`.
- Database migrations: backward-compatible expand/contract pattern.

## Smoke test script (post-deploy)

```bash
API=https://api.staging.example
curl -sf "$API/actuator/health" | jq -e '.status == "UP"'
curl -sf -o /dev/null -w "%{http_code}" "$API/api/v1/auth/login" -X POST \
  -H "Content-Type: application/json" -d '{"username":"x","password":"y"}' 
# expect 401/400, not 502/503
```

Frontend: load `/`, verify `index.html` and main JS bundle 200.
