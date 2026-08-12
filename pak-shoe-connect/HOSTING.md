# 🌐 SherSha B2B Footwear Marketplace

## Production Hosting & Operational Runbook

**Version:** 1.0.0  
**Deployment Target:** AWS ECS Fargate (Multi-AZ)  
**Application:** SherSha B2B Footwear Marketplace  
**Runtime:** Node.js 20 LTS  
**Maintainer:** SherSha DevOps & Infrastructure Engineering (`devops@shersha.pk`)  

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Architecture Overview](#2-architecture-overview)
3. [Infrastructure Requirements](#3-infrastructure-requirements)
4. [Software Requirements](#4-software-requirements)
5. [Environment Variables](#5-environment-variables)
6. [AWS Services](#6-aws-services)
7. [Database Deployment (PostgreSQL)](#7-database-deployment-postgresql)
8. [Redis Deployment (ElastiCache)](#8-redis-deployment-elasticache)
9. [Meilisearch Search Engine Deployment](#9-meilisearch-search-engine-deployment)
10. [Docker Containerization](#10-docker-containerization)
11. [Amazon Elastic Container Registry (ECR)](#11-amazon-elastic-container-registry-ecr)
12. [Amazon ECS Fargate Orchestration](#12-amazon-ecs-fargate-orchestration)
13. [Application Load Balancer (ALB)](#13-application-load-balancer-alb)
14. [Route53 DNS Management](#14-route53-dns-management)
15. [SSL/TLS Certificate (ACM)](#15-ssltls-certificate-acm)
16. [AWS WAF (Web Application Firewall) Configuration](#16-aws-waf-web-application-firewall-configuration)
17. [Database Migration Strategy](#17-database-migration-strategy)
18. [Seed Data & Master Accounts](#18-seed-data--master-accounts)
19. [Health Probes & Liveness Endpoints](#19-health-probes--liveness-endpoints)
20. [Auto Scaling Policies](#20-auto-scaling-policies)
21. [Monitoring & Telemetry (CloudWatch)](#21-monitoring--telemetry-cloudwatch)
22. [Backup & Retention Strategy](#22-backup--retention-strategy)
23. [Disaster Recovery & Failover Protocol](#23-disaster-recovery--failover-protocol)
24. [CI/CD Pipeline (GitHub Actions)](#24-cicd-pipeline-github-actions)
25. [Security Compliance Checklist](#25-security-compliance-checklist)
26. [Operational Troubleshooting Runbook](#26-operational-troubleshooting-runbook)
27. [Production Go-Live Verification Checklist](#27-production-go-live-verification-checklist)

---

# 1. Introduction

SherSha is an enterprise-grade B2B wholesale footwear marketplace designed for high availability, zero-downtime execution, secure multi-gateway payment processing (JazzCash, EasyPaisa, PayFast 1Link, Direct Bank Transfer), 3-state inventory locks, and horizontal scalability across Pakistan and international trading hubs.

This document serves as the **authoritative operational runbook and deployment manual**. It provides step-by-step instructions for DevOps engineers, Site Reliability Engineers (SREs), and system administrators to provision, deploy, scale, monitor, and troubleshoot the production infrastructure on **Amazon Web Services (AWS)**.

### High Availability Goals
* **Target Uptime**: 99.9% monthly availability (RTO < 30 mins, RPO < 5 mins).
* **Multi-AZ Resilience**: Zero single point of failure across compute, database, caching, and load balancing.
* **Security Controls**: OWASP Top 10 compliance, WAF protection, non-root containers, and zero PII/hash leakage.

---

# 2. Architecture Overview

### 2.1 Multi-AZ Cloud Infrastructure Diagram

```text
                               ┌────────────────────────────────┐
                               │     Route 53 (DNS / Anycast)   │
                               └───────────────┬────────────────┘
                                               │ HTTPS (443)
                               ┌───────────────▼────────────────┐
                               │   AWS WAF (Web App Firewall)   │
                               └───────────────┬────────────────┘
                                               │
                               ┌───────────────▼────────────────┐
                               │ Application Load Balancer (ALB)│
                               └───────────────┬────────────────┘
                                               │
                 ┌─────────────────────────────┴─────────────────────────────┐
                 │ Public Subnets (Multi-AZ)                                 │
                 └───────────────┬───────────────────────────────┬───────────┘
                                 │                               │
                 ┌───────────────▼───────────────┐ ┌─────────────▼─────────────┐
                 │ Private Subnet (AZ-A)         │ │ Private Subnet (AZ-B)     │
                 │ ECS Fargate Container (Task 1)│ │ ECS Fargate Container (Task 2)│
                 └───────────────┬───────────────┘ └─────────────┬─────────────┘
                                 │                               │
      ┌──────────────────────────┼───────────────────────────────┼──────────────────────────┐
      │ Database Subnets         │                               │                          │
      │ ┌────────────────────────▼─────┐          ┌──────────────▼──────────────┐           │
      │ │ Amazon RDS PostgreSQL        │          │ AWS ElastiCache Redis      │           │
      │ │ (Primary - Multi-AZ)         │          │ (Primary - Multi-AZ)       │           │
      │ └──────────────┬───────────────┘          └──────────────┬──────────────┘           │
      │                │ Sync Replication                        │ Replica                  │
      │ ┌──────────────▼───────────────┐          ┌──────────────▼──────────────┐           │
      │ │ Amazon RDS PostgreSQL        │          │ AWS ElastiCache Redis      │           │
      │ │ (Standby - AZ-B)             │          │ (Replica - AZ-B)            │           │
      │ └──────────────────────────────┘          └─────────────────────────────┘           │
      └─────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Component Description

* **Route 53**: Geo-routed DNS with health-checked failover to primary ALB.
* **AWS WAFv2**: Protects API Gateway from SQLi, XSS, rate-limiting violations, and bad bots.
* **Application Load Balancer (ALB)**: SSL/TLS termination, path-based routing, and target group health checks.
* **ECS Fargate**: Serverless container execution across 2 Availability Zones running hardened Node.js 20 runtime.
* **RDS PostgreSQL**: Multi-AZ db.r6g.large database with automated storage scaling, SSL encryption, and PITR.
* **ElastiCache Redis**: Multi-AZ cache and BullMQ job queue manager for payment idempotency and rate limiting.
* **Meilisearch**: Fast catalog indexing server with seamless PostgreSQL fallback.

---

# 3. Infrastructure Requirements

Recommended production infrastructure sizing for baseline 10,000 daily active buyers and suppliers:

| Component | AWS Resource | Instance Type / Specification | Multi-AZ | Scaling Policy |
| :--- | :--- | :--- | :---: | :--- |
| **Compute** | ECS Fargate Tasks | 2 vCPU / 4 GB RAM per task | Yes | Min 2 Tasks, Max 10 Tasks |
| **Database** | RDS PostgreSQL 16 | `db.r6g.large` (2 vCPU, 16GB RAM, 100GB GP3) | Yes | Auto-scale storage up to 500GB |
| **Cache/Queue**| ElastiCache Redis | `cache.r6g.large` (2 nodes, TLS enabled) | Yes | Automatic Failover |
| **Search** | ECS / EC2 | `t4g.medium` (2 vCPU, 4GB RAM, GP3) | Optional| PostgreSQL fallback enabled |
| **Load Balancer**| ALB | Application Load Balancer | Yes | Auto-scaled by AWS |
| **Network** | VPC | 2 Public, 2 Private, 2 Database Subnets | Yes | NAT Gateways per AZ |

---

# 4. Software Requirements

System requirements for build tools, deployment agents, and developer machines:

| Software | Minimum Version | Purpose |
| :--- | :--- | :--- |
| **Node.js** | `v20.19.0 LTS` | Application execution environment |
| **Docker** | `27.0.0+` | Container image packaging |
| **Terraform** | `1.8.0+` | Infrastructure-as-Code provisioning |
| **AWS CLI** | `v2.15.0+` | AWS service orchestration & ECR authentication |
| **Prisma CLI** | `v6.19.3` | Database migration & client generation |
| **Git** | `2.40.0+` | Source version control |

---

# 5. Environment Variables

Environment variables are organized into domain categories. Production variables **must** be stored in **AWS Secrets Manager** or **AWS SSM Parameter Store** and injected into ECS task definitions at runtime.

### 5.1 Application & Core Runtime
```ini
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
APP_URL=https://shersha.pk
```

### 5.2 Database (RDS PostgreSQL)
```ini
# Main database pool connection
DATABASE_URL="postgresql://shersha_admin:SECURE_PASSWORD@shersha-prod-postgres.c123456789.us-east-1.rds.amazonaws.com:5432/shershadb?schema=public&sslmode=require&connection_limit=30"

# Direct URL for Prisma migrations
DIRECT_URL="postgresql://shersha_admin:SECURE_PASSWORD@shersha-prod-postgres.c123456789.us-east-1.rds.amazonaws.com:5432/shershadb?schema=public&sslmode=require"
```

### 5.3 Redis & Queue Manager
```ini
REDIS_HOST="shersha-prod-redis.c123456789.us-east-1.clustercache.amazonaws.com"
REDIS_PORT=6379
REDIS_PASSWORD="SECURE_REDIS_AUTH_TOKEN"
REDIS_TLS=true
```

### 5.4 JWT & Security Authentication
```ini
JWT_SECRET="64_BYTE_RANDOM_HEX_SECURE_TOKEN_GENERATED_VIA_CRYPTO"
JWT_EXPIRES_IN=3600
```

### 5.5 Payment Gateway Credentials
```ini
# EasyPaisa Gateway
EASYPAISA_STORE_ID="12345"
EASYPAISA_HASH_KEY="EASYPAISA_PRODUCTION_HMAC_SECRET"

# JazzCash Gateway
JAZZCASH_MERCHANT_ID="JC_PROD_MERCHANT_ID"
JAZZCASH_PASSWORD="JC_PROD_PASSWORD"
JAZZCASH_INTEGRITY_SALT="JC_PROD_SALT"

# PayFast (1Link) Gateway
PAYFAST_MERCHANT_ID="PAYFAST_PROD_ID"
PAYFAST_SECURE_KEY="PAYFAST_PROD_SECURE_KEY"
```

### 5.6 Supabase Integration
```ini
VITE_SUPABASE_URL="https://ydkdicudwhxrukppucxy.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_prod_key"
```

---

# 6. AWS Services Reference

The production stack utilizes the following 10 AWS managed services:

1. **Amazon ECS (Fargate)**: Serverless compute engine for Docker containers.
2. **AWS Application Load Balancer (ALB)**: Layer 7 load balancer with HTTPS offloading.
3. **Amazon RDS for PostgreSQL**: Multi-AZ relational database.
4. **Amazon ElastiCache for Redis**: In-memory caching and message broker.
5. **Amazon ECR**: Container image registry.
6. **AWS WAFv2**: Layer 7 firewalls protecting against OWASP Top 10 vulnerabilities.
7. **AWS Secrets Manager**: Encrypted storage for passwords, keys, and tokens.
8. **Amazon Route 53**: Scalable DNS and domain name routing.
9. **AWS Certificate Manager (ACM)**: Free SSL/TLS certificate issuing and auto-renewal.
10. **Amazon CloudWatch**: Centralized log aggregation, metric collection, and alarms.

---

# 7. Database Deployment (PostgreSQL)

### Step 7.1: Provision RDS Instance
Provision PostgreSQL 16 on RDS using Multi-AZ deployment.

* **Database Engine**: PostgreSQL 16.2
* **Instance Class**: `db.r6g.large`
* **Storage Type**: GP3 (100 GB allocated, 500 GB max)
* **Encryption**: AWS KMS default key enabled
* **Backup Retention**: 7 Days (Point-In-Time Recovery enabled)

### Step 7.2: Apply Production Database Migrations
Run Prisma migrations against the RDS instance prior to container deployment:

```bash
export DATABASE_URL="postgresql://shersha_admin:SECURE_PASSWORD@shersha-prod-postgres.rds.amazonaws.com:5432/shershadb?sslmode=require"

# Execute migrations safely
npx prisma migrate deploy

# Verify schema state
npx prisma status
```

---

# 8. Redis Deployment (ElastiCache)

Redis manages rate limiting, payment idempotency locks, BullMQ queue events, and session caching.

### Provisioning Guidelines
* **Cluster Mode**: Enabled (Multi-AZ with automatic failover)
* **Node Type**: `cache.r6g.large` (2 nodes minimum)
* **Encryption**: In-transit (TLS) and At-rest enabled
* **Eviction Policy**: `volatile-lru` (prevents eviction of payment locks)

---

# 9. Meilisearch Search Engine Deployment

Meilisearch provides fast catalog search with full Urdu and English text search capabilities.

### Deployment & Fallback Architecture
* **Primary Instance**: Deployed via ECS task or EC2 (`t4g.medium`).
* **Storage**: Amazon EBS GP3 volume attached with hourly snapshot backups.
* **Resilience Guard**: If Meilisearch is unreachable, `SearchService` automatically falls back to PostgreSQL full-text search without throwing user-facing errors.

---

# 10. Docker Containerization

The application uses a multi-stage Docker build producing a hardened non-root container image based on `node:20.19-alpine`.

### 10.1 Build Container Image
```bash
docker build -t shersha-b2b-gateway:latest .
```

### 10.2 Run Container Locally for Testing
```bash
docker run -d \
  --name shersha-app \
  -p 3000:3000 \
  --env-file .env.production \
  shersha-b2b-gateway:latest
```

---

# 11. Amazon Elastic Container Registry (ECR)

### Step 11.1: Authenticate to ECR
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com
```

### Step 11.2: Tag & Push Image
```bash
docker tag shersha-b2b-gateway:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/shersha-b2b-gateway:v1.0.0
docker tag shersha-b2b-gateway:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/shersha-b2b-gateway:latest

docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/shersha-b2b-gateway:v1.0.0
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/shersha-b2b-gateway:latest
```

---

# 12. Amazon ECS Fargate Orchestration

### 12.1 Task Definition Specification
* **CPU**: 2048 (2 vCPU)
* **Memory**: 4096 (4 GB)
* **Execution Role**: `ecsTaskExecutionRole` (granting access to ECR and Secrets Manager)
* **Network Mode**: `awsvpc`

### 12.2 Deployment & Rolling Updates
Deploy updates zero-downtime using rolling updates:

```bash
aws ecs update-service \
  --cluster shersha-prod-cluster \
  --service shersha-gateway-service \
  --task-definition shersha-gateway-task \
  --force-new-deployment \
  --region us-east-1
```

---

# 13. Application Load Balancer (ALB)

### Listener Configuration
* **Port 80 (HTTP)**: Redirects all traffic to HTTPS (443).
* **Port 443 (HTTPS)**: Uses ACM SSL certificate and forwards to ECS Target Group.

### Target Group Health Check Settings
* **Path**: `/health/live`
* **Protocol**: HTTP
* **Interval**: 15 seconds
* **Timeout**: 5 seconds
* **Healthy Threshold**: 2
* **Unhealthy Threshold**: 3

---

# 14. Route53 DNS Management

### Record Setup
* **Apex Record (`anamonofficial.com`)**: A-record alias pointing directly to ALB dualstack DNS name with `evaluate_target_health = true`.
* **Subdomain Record (`www.anamonofficial.com`)**: CNAME alias pointing to `anamonofficial.com`.
* **Latency & Geo Routing**: Enabled for multi-region scalability.

---

# 15. SSL/TLS Certificate (ACM)

* **Provider**: AWS Certificate Manager (ACM)
* **Domain Name**: `anamonofficial.com`, `*.anamonofficial.com`
* **Validation**: DNS validation via Route 53 CNAME records.
* **Renewal**: Managed automatically by AWS ACM (zero-touch).

---

# 16. AWS WAF (Web Application Firewall) Configuration

Protect the ALB using WAFv2 regional web ACL with rules:
1. **AWSManagedRulesCommonRuleSet**: Blocks OWASP Top 10 vulnerabilities (SQLi, XSS, OS Injection).
2. **AWSManagedRulesKnownBadInputsRuleSet**: Rejects malformed requests and dangerous payloads.
3. **Rate-Based Rule**: Limits IP to 1,000 requests per 5-minute window to prevent DDoS attacks.

---

# 17. Database Migration Strategy

Production migrations use **Expand-Contract (Parallel Adoption)** to prevent downtime:
1. **Expand**: Add new columns/tables in advance without removing old fields.
2. **Deploy**: Deploy updated container tasks consuming new columns.
3. **Contract**: Remove deprecated columns in follow-up migration after verification.

---

# 18. Seed Data & Master Accounts

Execute seeding script to initialize categories and master system roles:

```bash
npm run db:seed
```

---

# 19. Health Probes & Liveness Endpoints

The system exposes 3 health endpoints for orchestrator probes:

1. `GET /health/live`: Liveness probe — returns HTTP 200 if process event loop is responsive.
2. `GET /health/ready`: Readiness probe — returns HTTP 200 if database and Redis connections are active.
3. `GET /health/startup`: Startup probe — returns HTTP 200 once initialization scripts conclude.

---

# 20. Auto Scaling Policies

Configure Target Tracking Scaling for ECS Fargate Service:
* **Metric 1**: Average CPU Utilization > 70% ➔ Scale Out +2 Tasks.
* **Metric 2**: Average Memory Utilization > 75% ➔ Scale Out +2 Tasks.
* **Metric 3**: ALB Request Count Per Target > 1,000 ➔ Scale Out +2 Tasks.
* **Scale-In Cooldown**: 300 seconds.

---

# 21. Monitoring & Telemetry (CloudWatch)

Centralized logging formats every request as JSON:
```json
{
  "event": "REQUEST",
  "correlationId": "REQ-19FD9F5D9AB-A5956833",
  "method": "POST",
  "path": "/api/v1/orders/create",
  "userId": "usr-buyer-001",
  "durationMs": 42
}
```

### CloudWatch Alarm Triggers
* **Alarm 1**: HTTP 5xx Error Rate > 1% over 5 minutes ➔ PagerDuty Alert.
* **Alarm 2**: Unhealthy Target Count > 0 ➔ Slack DevOps Alert.
* **Alarm 3**: Redis CPU > 80% ➔ SRE Scaling Alert.

---

# 22. Backup & Retention Strategy

| Target | Backup Type | Frequency | Retention | RPO / RTO Target |
| :--- | :--- | :--- | :--- | :--- |
| **RDS Postgres** | Automated Snapshots + PITR | Continuous | 7 Days | RPO < 5 mins, RTO < 30 mins |
| **Redis** | ElastiCache Snapshot | Daily | 3 Days | RPO < 24 hrs |
| **S3 Media Assets**| Cross-Region Replication | Real-time | Permanent | RPO < 1 min |

---

# 23. Disaster Recovery & Failover Protocol

### Regional Outage Recovery Sequence
1. RDS automatically fails over to Standby replica in AZ-B (< 60 seconds).
2. ElastiCache promotes Redis replica node in AZ-B (< 30 seconds).
3. ECS Fargate provisions replacement tasks in AZ-B.
4. If primary region fails, DNS failover redirects Route 53 to secondary AWS region.

---

# 24. CI/CD Pipeline (GitHub Actions)

Workflow trigger on push to `main` branch:
1. **Lint & Test Stage**: Runs `npm run lint`, `npx tsc --noEmit`, and `npx vitest run`.
2. **Container Stage**: Builds Docker container and tags with git commit SHA.
3. **Push Stage**: Pushes image to AWS ECR.
4. **Deploy Stage**: Triggers ECS service force new deployment.
5. **Verification Stage**: Executes smoke tests against `/health/ready`.

---

# 25. Security Compliance Checklist

- [x] HTTPS enforced everywhere (TLS 1.3).
- [x] HMAC-SHA256 signature verification on all incoming payment webhooks.
- [x] Four-Eyes dual control approval enforced for financial payout overrides.
- [x] Container executes as non-root user (`USER node`).
- [x] Secrets stored in AWS Secrets Manager (zero credentials in codebase).
- [x] Rate limiting active on all API gateway endpoints.
- [x] Database connections encrypted via SSL (`sslmode=require`).
- [x] DTO sanitization strips sensitive password hashes and tax numbers.

---

# 26. Operational Troubleshooting Runbook

### Common Issues & Resolution Steps

#### Issue 1: Database Connection Refused (`P1001`)
* **Cause**: RDS Security Group blocking ECS Task security group or incorrect DB host URL.
* **Resolution**: Verify RDS SG allows inbound port 5432 from ECS Task SG. Check `DATABASE_URL` in Secrets Manager.

#### Issue 2: Redis Unavailable / Connection Closed
* **Cause**: ElastiCache TLS configuration mismatch or subnet isolation.
* **Resolution**: Ensure `REDIS_TLS=true` is set. Verify ECS security group has access to Redis SG on port 6379.

#### Issue 3: ECS Container Unhealthy / Task Restarts
* **Cause**: Liveness probe failing on `/health/live` due to missing env variables or startup timeout.
* **Resolution**: Check CloudWatch container logs (`/ecs/shersha-gateway`). Ensure all required secrets exist.

#### Issue 4: Webhook Callback Returns 400 Bad Request
* **Cause**: Invalid HMAC signature or missing raw request body header.
* **Resolution**: Verify gateway hash keys match provider portal config (`EASYPAISA_HASH_KEY`, `JAZZCASH_INTEGRITY_SALT`).

---

# 27. Production Go-Live Verification Checklist

Complete and sign off all items prior to launching live traffic:

| Checklist Item | Domain | Responsible Role | Status |
| :--- | :--- | :--- | :---: |
| **Terraform Infrastructure Applied** | Infrastructure | DevOps Lead | [ ] |
| **RDS Multi-AZ Database Provisioned** | Database | DBA / Infra | [ ] |
| **Prisma Migrations Applied** | Database | Backend Lead | [ ] |
| **Database Seeding Completed** | Database | Backend Lead | [ ] |
| **ElastiCache Redis Cluster Active** | Caching | SRE | [ ] |
| **Docker Image Pushed to ECR** | Container | CI/CD Engineer | [ ] |
| **ECS Fargate Service Running (2+ Tasks)**| Compute | SRE | [ ] |
| **ALB Listener & Target Group Healthy** | Networking | Infra Lead | [ ] |
| **Route 53 DNS & SSL ACM Issued** | Security | Network Lead | [ ] |
| **AWS WAF Web ACL Attached** | Security | Security Lead | [ ] |
| **Health Probes (`/health/ready`) Passing**| Ops | SRE | [ ] |
| **CloudWatch Log Group & Alarms Configured**| Monitoring | SRE | [ ] |
| **Automated Backups Verified** | Backup | DBA | [ ] |
| **Vitest & E2E Simulation Smoke Tests Passed**| QA | QA Lead | [ ] |
| **Production Launch Sign-off** | Governance | Engineering Director | [ ] |

---

*Operational Runbook Authorized by SherSha Engineering Board — Version 1.0.0*
