# ─── ECR Repositories ─────────────────────────────────────────────────────────
# One repo for API, one for Worker. Each holds its own image history.
# Why separate repos: independent versioning, separate build triggers, cleaner audit trail.

resource "aws_ecr_repository" "api" {
  name                 = "${var.project_name}-api"
  image_tag_mutability = "MUTABLE"   # allows :latest tag to be overwritten

  image_scanning_configuration {
    scan_on_push = true   # ECR scans for OS/library vulnerabilities on every push (free)
  }

  tags = { Project = var.project_name, Service = "api" }
}

resource "aws_ecr_repository" "worker" {
  name                 = "${var.project_name}-worker"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = { Project = var.project_name, Service = "worker" }
}

# ─── ECR Lifecycle Policy ─────────────────────────────────────────────────────
# Keep only the last 10 tagged images per repo.
# Old images accumulate silently and cost money in storage.

resource "aws_ecr_lifecycle_policy" "api" {
  repository = aws_ecr_repository.api.name
  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep only last 10 tagged images"
      selection = {
        tagStatus   = "tagged"
        tagPrefixList = ["v", "sha"]
        countType   = "imageCountMoreThan"
        countNumber = 10
      }
      action = { type = "expire" }
    }]
  })
}

resource "aws_ecr_lifecycle_policy" "worker" {
  repository = aws_ecr_repository.worker.name
  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep only last 10 tagged images"
      selection = {
        tagStatus   = "tagged"
        tagPrefixList = ["v", "sha"]
        countType   = "imageCountMoreThan"
        countNumber = 10
      }
      action = { type = "expire" }
    }]
  })
}

# ─── S3: Uploads Bucket ───────────────────────────────────────────────────────
# Stores temporary uploaded files before the worker processes them.
# Files are deleted by the worker after processing.
# Lifecycle rule auto-deletes any orphaned files after 24h.

resource "aws_s3_bucket" "uploads" {
  bucket = "${var.project_name}-uploads-${var.environment}"
  tags   = { Project = var.project_name }
}

resource "aws_s3_bucket_lifecycle_configuration" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  rule {
    id     = "delete-temp-uploads"
    status = "Enabled"

    filter { prefix = "uploads/temp/" }

    expiration {
      days = 1   # auto-delete any temp file the worker failed to clean up
    }
  }
}

resource "aws_s3_bucket_public_access_block" "uploads" {
  bucket                  = aws_s3_bucket.uploads.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ─── S3: Frontend Bucket ──────────────────────────────────────────────────────
# Hosts the React static site. CloudFront reads from this bucket.
# The bucket is NOT public — CloudFront accesses it via Origin Access Control.

resource "aws_s3_bucket" "frontend" {
  bucket = "${var.project_name}-frontend-${var.environment}"
  tags   = { Project = var.project_name }
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket                  = aws_s3_bucket.frontend.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ─── SQS Queue ────────────────────────────────────────────────────────────────
# Standard queue (not FIFO) — ordering doesn't matter for file processing.
# Each message = one content processing job.

resource "aws_sqs_queue" "processing_dlq" {
  name = "${var.project_name}-processing-dlq"
  # Messages in DLQ stay for 14 days so you can investigate failures
  message_retention_seconds = 1209600   # 14 days
  tags = { Project = var.project_name }
}

resource "aws_sqs_queue" "processing" {
  name                       = "${var.project_name}-processing-queue"
  visibility_timeout_seconds = 900      # 15 min — must be >= longest job duration
  message_retention_seconds  = 86400    # 24 hours — if unprocessed for a day, something is wrong
  receive_wait_time_seconds  = 20       # long-polling — saves API calls and cost

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.processing_dlq.arn
    maxReceiveCount     = 3             # after 3 failed attempts, move to DLQ
  })

  tags = { Project = var.project_name }
}

# ─── SSM Parameter Store: Secrets ────────────────────────────────────────────
# ECS tasks read these at startup. No secrets in environment variables, Docker images, or code.

resource "aws_ssm_parameter" "mongodb_uri" {
  name  = "/${var.project_name}/mongodb-uri"
  type  = "SecureString"
  value = var.mongodb_uri != "" ? var.mongodb_uri : "placeholder-set-after-docdb-created"
  tags  = { Project = var.project_name }
}

resource "aws_ssm_parameter" "groq_api_key" {
  name  = "/${var.project_name}/groq-api-key"
  type  = "SecureString"
  value = var.groq_api_key != "" ? var.groq_api_key : "placeholder"
  tags  = { Project = var.project_name }
}

resource "aws_ssm_parameter" "jwt_secret" {
  name  = "/${var.project_name}/jwt-secret"
  type  = "SecureString"
  value = var.jwt_secret != "" ? var.jwt_secret : "placeholder"
  tags  = { Project = var.project_name }
}

resource "aws_ssm_parameter" "aws_account_id" {
  name  = "/${var.project_name}/aws-account-id"
  type  = "String"
  value = data.aws_caller_identity.current.account_id
  tags  = { Project = var.project_name }
}
