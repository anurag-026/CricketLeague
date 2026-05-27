# Production Deployment Checklist

Use this for every production release. Copy into your PR or release ticket.

## Pre-deploy (T-24h)

### Security

- `JWT_SECRET` stored in secrets manager (≥32 chars, unique per env)
- DB and Redis credentials rotated from dev defaults (`mol`/`mol`)
- `spring.jpa.hibernate.ddl-auto` is `validate` or `none` (migrations via Flyway)
- CORS / WebSocket origins restricted to production frontend URL(s)
- TLS certificates valid; auto-renewal configured
- WAF / rate limiting on auth and room endpoints planned or enabled
- Container images scanned (Trivy/Snyk); no critical CVEs unmitigated

### Data

- PostgreSQL Multi-AZ (or equivalent) enabled
- Automated backups verified (restore test in last 90 days)
- Redis replication enabled; eviction policy documented
- Connection pool sizes tuned for expected load

### Application

- `SPRING_PROFILES_ACTIVE=prod`
- Actuator health + readiness probes configured
- Frontend built with correct `VITE_API_BASE_URL` and `VITE_WS_URL` (`wss://`)
- WebSocket scaling strategy documented (single replica OR Redis broker)
- Feature flags / kill switch for matchmaking (optional)

### CI/CD

- All tests green on release commit
- Image tagged with immutable digest
- Staging deploy smoke-tested
- DB migration reviewed and tested on staging snapshot
- Rollback image digest recorded

### Observability

- Log shipping to central store
- Dashboards imported; on-call has access
- Alerts wired to on-call rotation
- Runbook link in alert annotations

## Deploy (T-0)

- Announce maintenance window (if breaking change)
- Run database migrations
- Deploy backend; wait for rollout complete
- Verify `/actuator/health` = UP (DB + Redis components)
- Deploy frontend
- Run smoke tests (health, login error shape, WS handshake)
- Spot-check: create room → join → play one ball in staging-like prod test account

## Post-deploy (T+30m)

- Error rate within baseline
- p95 latency within SLO
- No spike in STOMP auth failures
- Redis memory stable
- Update status page / changelog
- Close release ticket

## Rollback criteria (any → rollback)

- Health check failing > 3 minutes
- 5xx rate > 1% sustained 5 minutes
- WS connect success < 95%
- Data corruption or migration failure

## Quarterly hygiene

- Restore drill from RDS snapshot
- Secret rotation drill
- Review and prune old container images
- Dependency updates (Spring, Node) on schedule
- Penetration test or OWASP ZAP baseline scan

