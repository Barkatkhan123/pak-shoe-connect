# SherSha B2B Marketplace — Terraform Production Infrastructure
# Cloud Provider: AWS
# Architecture: ECS Fargate Multi-AZ + RDS Postgres + ElastiCache Redis + WAF + ALB

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Environment = var.environment
      Project     = "SherSha-B2B-Footwear"
      ManagedBy   = "Terraform"
    }
  }
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "environment" {
  type    = string
  default = "production"
}

# ── 1. MULTI-AZ VPC & SUBNET TOPOLOGY ──
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "shersha-prod-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["${var.aws_region}a", "${var.aws_region}b"]
  public_subnets  = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnets = ["10.0.10.0/24", "10.0.11.0/24"]
  database_subnets = ["10.0.20.0/24", "10.0.21.0/24"]

  enable_nat_gateway     = true
  single_nat_gateway     = false # High Availability per AZ
  enable_vpn_gateway     = false
  enable_dns_hostnames   = true
  enable_dns_support     = true
}

# ── 2. AWS WAF (WEB APPLICATION FIREWALL) ──
resource "aws_wafv2_web_acl" "main" {
  name        = "shersha-prod-waf"
  scope       = "REGIONAL"
  description = "WAF protecting API Gateway from SQLi, XSS, and rate limiting attacks"

  default_action {
    allow {}
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "SherShaWAFMetrics"
    sampled_requests_enabled   = true
  }

  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 1
    override_action {
      none {}
    }
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWSCommonRules"
      sampled_requests_enabled   = true
    }
  }
}

# ── 3. APPLICATION LOAD BALANCER (ALB) ──
resource "aws_lb" "gateway_alb" {
  name               = "shersha-prod-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = module.vpc.public_subnets
}

resource "aws_security_group" "alb_sg" {
  name        = "shersha-alb-sg"
  description = "Allow inbound HTTPS traffic"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

variable "db_password" {
  type        = string
  description = "Master database administrator password"
  sensitive   = true
}

# ── 4. AMAZON RDS POSTGRESQL MULTI-AZ ──
resource "aws_db_instance" "postgres" {
  identifier           = "shersha-prod-postgres"
  allocated_storage    = 100
  max_allocated_storage = 500
  engine               = "postgres"
  engine_version       = "15.4"
  instance_class       = "db.r6g.large"
  multi_az             = true
  db_name              = "shershadb"
  username             = "shersha_admin"
  password             = var.db_password
  db_subnet_group_name = module.vpc.database_subnet_group_name
  skip_final_snapshot  = false
  backup_retention_period = 7
  storage_encrypted    = true
}

# ── 5. ELASTICACHE REDIS CLUSTER MULTI-AZ ──
resource "aws_elasticache_replication_group" "redis" {
  replication_group_id          = "shersha-prod-redis"
  replication_group_description = "Redis cluster for rate limiting and payment idempotency"
  node_type                     = "cache.r6g.large"
  num_cache_clusters            = 2
  automatic_failover_enabled    = true
  multi_az_enabled              = true
  at_rest_encryption_enabled    = true
  transit_encryption_enabled    = true
  subnet_group_name             = module.vpc.database_subnet_group_name
}

# ── 6. AWS ECS FARGATE CLUSTER & SERVICE ──
resource "aws_ecs_cluster" "main" {
  name = "shersha-prod-cluster"
}

resource "aws_ecs_task_definition" "gateway_task" {
  family                   = "shersha-gateway-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 1024 # 1 vCPU
  memory                   = 2048 # 2 GB

  container_definitions = jsonencode([
    {
      name      = "shersha-gateway"
      image     = "shersha-b2b-gateway:latest"
      essential = true
      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
        }
      ]
      healthCheck = {
        command     = ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:3000/health/live || exit 1"]
        interval    = 15
        timeout     = 5
        retries     = 3
        startPeriod = 10
      }
    }
  ])
}

# ── 7. DOMAIN, ROUTE 53 & ACM TLS CERTIFICATE ──
variable "domain_name" {
  type        = string
  description = "Production apex domain name"
  default     = "anamonofficial.com"
}

resource "aws_route53_zone" "primary" {
  name = var.domain_name
}

resource "aws_acm_certificate" "cert" {
  domain_name       = var.domain_name
  subject_alternative_names = ["*.${var.domain_name}"]
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = aws_route53_zone.primary.zone_id
}

resource "aws_acm_certificate_validation" "cert_val" {
  certificate_arn         = aws_acm_certificate.cert.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}

# ── 8. ROUTE 53 APEX & SUBDOMAIN ALIASES ──
resource "aws_route53_record" "apex" {
  zone_id = aws_route53_zone.primary.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_lb.gateway_alb.dns_name
    zone_id                = aws_lb.gateway_alb.zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "www" {
  zone_id = aws_route53_zone.primary.zone_id
  name    = "www.${var.domain_name}"
  type    = "CNAME"
  ttl     = 300
  records = [var.domain_name]
}
