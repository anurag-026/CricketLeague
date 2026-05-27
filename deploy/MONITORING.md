# Monitoring & Logging Strategy

## Observability pillars

| Pillar | Tooling (pick one stack) | MyOwnLeague focus |
|--------|--------------------------|-------------------|
| Logs | CloudWatch / Loki / ELK | Auth failures, WS disconnects, match errors |
| Metrics | Prometheus + Grafana / Datadog | Latency, Redis/DB pool, JVM |
| Traces | OpenTelemetry + Tempo/Jaeger | Request path REST → Redis |
| Alerts | PagerDuty / Opsgenie | SLO burn, health down |

## Golden signals (SLO-oriented)

| Signal | SLI | Target (initial) |
|--------|-----|------------------|
| Availability | `actuator/health` UP | 99.5% monthly |
| Latency | REST p95 < 300ms | Exclude cold start |
| Errors | 5xx rate < 0.1% | Per endpoint |
| Saturation | JVM heap < 80%, Redis memory < 75% | |
| WS quality | STOMP connect success rate > 99% | Custom metric |

## Backend instrumentation

### Add Spring Boot Actuator (required)

Dependencies: `spring-boot-starter-actuator`, optional `micrometer-registry-prometheus`.

Expose (prod):

```properties
management.endpoints.web.exposure.include=health,info,prometheus
management.endpoint.health.probes.enabled=true
management.health.redis.enabled=true
management.health.db.enabled=true
```

Security: permit only `/actuator/health/**` and `/actuator/prometheus` (internal network or scrape auth).

### Key metrics to export

- `http.server.requests` — latency by URI
- `jvm.memory.used`, `jvm.gc.pause`
- `lettuce.command.completion` — Redis
- `hikaricp.connections.active` — PostgreSQL pool
- Custom: `mol.match.active`, `mol.ws.connections`, `mol.room.created`

### Structured logging

Use JSON layout in prod (Logback `logstash-logback-encoder`):

```json
{
  "timestamp": "...",
  "level": "INFO",
  "service": "mol-backend",
  "traceId": "...",
  "userId": "...",
  "matchId": "...",
  "message": "Ball bowled"
}
```

**Never log**: JWTs, passwords, full request bodies with secrets.

### Log levels

| Logger | Level |
|--------|-------|
| `com.mol.anurag` | INFO |
| `org.springframework.web` | WARN |
| `org.hibernate.SQL` | OFF in prod |

## Frontend monitoring

- **Real User Monitoring**: Sentry or Datadog RUM — JS errors, API failures.
- **Synthetic**: Pingdom check `https://app.example/` every 1 min.
- **Web Vitals**: LCP/FID via analytics (optional).

## Redis & PostgreSQL

| Store | Monitor |
|-------|---------|
| Redis | CPU, memory, evictions, connected clients, replication lag |
| PostgreSQL | CPU, connections, disk, slow queries (`log_min_duration_statement=500`) |

Alerts:

- Redis memory > 80% for 5 min
- PG connections > 80% of max
- Replication lag > 30s

## Dashboards (Grafana)

1. **API overview**: RPS, p50/p95/p99, 4xx/5xx, pod count
2. **Game health**: active matches (gauge), queue depth, room create rate
3. **Infrastructure**: RDS, ElastiCache, ingress 5xx
4. **CI/CD**: deploy frequency, failed pipelines

## Alert rules (examples)

| Alert | Condition | Severity |
|-------|-----------|----------|
| API down | health UP == 0 for 2m | P1 |
| High 5xx | rate(5xx) > 1% for 5m | P1 |
| High latency | p95 > 1s for 10m | P2 |
| Redis unreachable | health component DOWN | P1 |
| Disk full | PG storage < 10% | P1 |
| Cert expiry | < 14 days | P2 |

## Incident response

1. Acknowledge alert; check status page.
2. Grafana: error rate, recent deploys.
3. Logs: filter `level=ERROR` last 15m, group by `exception`.
4. If deploy-correlated → rollback (see WORKFLOW.md).
5. Postmortem within 48h for P1.

## Log retention

| Tier | Retention |
|------|-----------|
| Hot (search) | 14–30 days |
| Cold (archive) | 90–365 days per compliance |
| Audit (auth events) | 1 year if required |
