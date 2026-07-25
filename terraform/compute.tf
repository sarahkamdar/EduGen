# ─── IAM: ECS Task Execution Role ─────────────────────────────────────────────
# Used by ECS to: pull images from ECR, write logs to CloudWatch, read SSM secrets.

resource "aws_iam_role" "ecs_execution" {
  name = "${var.project_name}-ecs-execution-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_execution_managed" {
  role       = aws_iam_role.ecs_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Allow ECS to read SSM SecureString parameters at container startup
resource "aws_iam_role_policy" "ecs_execution_ssm" {
  name = "read-ssm-secrets"
  role = aws_iam_role.ecs_execution.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["ssm:GetParameters", "ssm:GetParameter"]
      Resource = "arn:aws:ssm:${var.aws_region}:${local.account_id}:parameter/${var.project_name}/*"
    }]
  })
}

# ─── IAM: ECS Task Role ───────────────────────────────────────────────────────
# Used by application code running inside containers.
# API task: needs S3 (upload/delete PPTs), SQS (send messages).
# Worker task: needs S3 (download/delete uploads), SQS (receive/delete messages).

resource "aws_iam_role" "ecs_task" {
  name = "${var.project_name}-ecs-task-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "ecs_task_permissions" {
  name = "app-permissions"
  role = aws_iam_role.ecs_task.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "S3Access"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket",
        ]
        Resource = [
          aws_s3_bucket.uploads.arn,
          "${aws_s3_bucket.uploads.arn}/*",
        ]
      },
      {
        Sid    = "SQSAccess"
        Effect = "Allow"
        Action = [
          "sqs:SendMessage",
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes",
          "sqs:GetQueueUrl",
        ]
        Resource = [
          aws_sqs_queue.processing.arn,
          aws_sqs_queue.processing_dlq.arn,
        ]
      },
      {
        Sid    = "CloudWatchLogs"
        Effect = "Allow"
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents",
        ]
        Resource = "*"
      }
    ]
  })
}

# ─── IAM: CodeBuild Role ──────────────────────────────────────────────────────
# Used by CodeBuild projects to: pull source, build Docker, push to ECR, read SSM.

resource "aws_iam_role" "codebuild" {
  name = "${var.project_name}-codebuild-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "codebuild.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "codebuild_permissions" {
  name = "codebuild-permissions"
  role = aws_iam_role.codebuild.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ECRAuth"
        Effect = "Allow"
        Action = ["ecr:GetAuthorizationToken"]
        Resource = "*"
      },
      {
        Sid    = "ECRPush"
        Effect = "Allow"
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:CompleteLayerUpload",
          "ecr:InitiateLayerUpload",
          "ecr:PutImage",
          "ecr:UploadLayerPart",
        ]
        Resource = [
          aws_ecr_repository.api.arn,
          aws_ecr_repository.worker.arn,
        ]
      },
      {
        Sid    = "Logs"
        Effect = "Allow"
        Action = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
        Resource = "*"
      },
      {
        Sid    = "SSM"
        Effect = "Allow"
        Action = ["ssm:GetParameters", "ssm:GetParameter"]
        Resource = "arn:aws:ssm:${var.aws_region}:${local.account_id}:parameter/${var.project_name}/*"
      }
    ]
  })
}

# ─── IAM: GitHub Actions IAM User ────────────────────────────────────────────
# Least-privilege user for GitHub Actions.
# Can: trigger CodeBuild, update ECS services, sync S3, invalidate CloudFront.
# Cannot: read secrets, access DocumentDB, or create/delete infrastructure.

resource "aws_iam_user" "github_actions" {
  name = "${var.project_name}-github-actions"
  tags = { Project = var.project_name }
}

resource "aws_iam_user_policy" "github_actions" {
  name = "cicd-permissions"
  user = aws_iam_user.github_actions.name
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "CodeBuild"
        Effect = "Allow"
        Action = ["codebuild:StartBuild", "codebuild:BatchGetBuilds"]
        Resource = [
          aws_codebuild_project.api.arn,
          aws_codebuild_project.worker.arn,
        ]
      },
      {
        Sid    = "ECS"
        Effect = "Allow"
        Action = [
          "ecs:UpdateService",
          "ecs:DescribeServices",
          "ecs:DescribeClusters",
        ]
        Resource = "*"
      },
      {
        Sid    = "S3Frontend"
        Effect = "Allow"
        Action = ["s3:PutObject", "s3:DeleteObject", "s3:ListBucket", "s3:GetObject"]
        Resource = [
          aws_s3_bucket.frontend.arn,
          "${aws_s3_bucket.frontend.arn}/*",
        ]
      },
      {
        Sid      = "CloudFront"
        Effect   = "Allow"
        Action   = ["cloudfront:CreateInvalidation"]
        Resource = aws_cloudfront_distribution.frontend.arn
      }
    ]
  })
}

resource "aws_iam_access_key" "github_actions" {
  user = aws_iam_user.github_actions.name
}

# ─── ECS: Cluster ─────────────────────────────────────────────────────────────

resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"   # enhanced CloudWatch metrics for ECS tasks
  }

  tags = { Project = var.project_name }
}

resource "aws_cloudwatch_log_group" "api" {
  name              = "/ecs/${var.project_name}/api"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "worker" {
  name              = "/ecs/${var.project_name}/worker"
  retention_in_days = 7
}

# ─── ECS: API Task Definition ─────────────────────────────────────────────────

resource "aws_ecs_task_definition" "api" {
  family                   = "${var.project_name}-api"
  cpu                      = var.api_cpu
  memory                   = var.api_memory
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([{
    name  = "edugen-api"
    image = "${local.ecr_base}/${aws_ecr_repository.api.name}:latest"

    portMappings = [{ containerPort = 8000, protocol = "tcp" }]

    # Secrets read from SSM Parameter Store at container startup
    secrets = [
      { name = "MONGODB_URI",  valueFrom = aws_ssm_parameter.mongodb_uri.arn },
      { name = "GROQ_API_KEY", valueFrom = aws_ssm_parameter.groq_api_key.arn },
      { name = "JWT_SECRET_KEY", valueFrom = aws_ssm_parameter.jwt_secret.arn },
    ]

    # Non-sensitive config as environment variables
    environment = [
      { name = "AWS_REGION",      value = var.aws_region },
      { name = "AWS_S3_BUCKET",   value = aws_s3_bucket.uploads.bucket },
      { name = "SQS_QUEUE_URL",   value = aws_sqs_queue.processing.url },
      { name = "ALLOWED_ORIGINS", value = "https://${aws_cloudfront_distribution.frontend.domain_name}" },
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.api.name
        awslogs-region        = var.aws_region
        awslogs-stream-prefix = "api"
      }
    }

    healthCheck = {
      command     = ["CMD-SHELL", "python -c \"import urllib.request; urllib.request.urlopen('http://localhost:8000/health', timeout=3)\""]
      interval    = 30
      timeout     = 5
      retries     = 3
      startPeriod = 60
    }
  }])
}

# ─── ECS: Worker Task Definition ─────────────────────────────────────────────

resource "aws_ecs_task_definition" "worker" {
  family                   = "${var.project_name}-worker"
  cpu                      = var.worker_cpu
  memory                   = var.worker_memory
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([{
    name  = "edugen-worker"
    image = "${local.ecr_base}/${aws_ecr_repository.worker.name}:latest"

    secrets = [
      { name = "MONGODB_URI",  valueFrom = aws_ssm_parameter.mongodb_uri.arn },
      { name = "GROQ_API_KEY", valueFrom = aws_ssm_parameter.groq_api_key.arn },
    ]

    environment = [
      { name = "AWS_REGION",    value = var.aws_region },
      { name = "AWS_S3_BUCKET", value = aws_s3_bucket.uploads.bucket },
      { name = "SQS_QUEUE_URL", value = aws_sqs_queue.processing.url },
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.worker.name
        awslogs-region        = var.aws_region
        awslogs-stream-prefix = "worker"
      }
    }
  }])
}

# ─── ECS: Services ────────────────────────────────────────────────────────────

resource "aws_ecs_service" "api" {
  name            = "${var.project_name}-api-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = var.api_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = data.aws_subnets.default.ids
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = true   # required in default VPC (no NAT gateway)
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "edugen-api"
    container_port   = 8000
  }

  depends_on = [aws_lb_listener.http]
  tags       = { Project = var.project_name }
}

resource "aws_ecs_service" "worker" {
  name            = "${var.project_name}-worker-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.worker.arn
  desired_count   = var.worker_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = data.aws_subnets.default.ids
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = true
  }

  # No load_balancer — worker polls SQS, doesn't serve HTTP
  tags = { Project = var.project_name }
}

# ─── Auto-Scaling: API (CPU-based) ────────────────────────────────────────────

resource "aws_appautoscaling_target" "api" {
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.api.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  min_capacity       = 1
  max_capacity       = var.api_max_count
}

resource "aws_appautoscaling_policy" "api_cpu" {
  name               = "${var.project_name}-api-cpu-scaling"
  service_namespace  = "ecs"
  resource_id        = aws_appautoscaling_target.api.resource_id
  scalable_dimension = aws_appautoscaling_target.api.scalable_dimension
  policy_type        = "TargetTrackingScaling"

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = 70.0   # scale out when CPU > 70%
    scale_in_cooldown  = 300    # 5 min — don't scale in too aggressively
    scale_out_cooldown = 60     # 1 min — scale out quickly to handle spikes
  }
}

# ─── Auto-Scaling: Worker (SQS queue depth) ───────────────────────────────────

resource "aws_appautoscaling_target" "worker" {
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.worker.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  min_capacity       = 1
  max_capacity       = var.worker_max_count
}

# Scale OUT alarm: queue depth > 2 → add a worker
resource "aws_cloudwatch_metric_alarm" "worker_scale_out" {
  alarm_name          = "${var.project_name}-worker-scale-out"
  namespace           = "AWS/SQS"
  metric_name         = "ApproximateNumberOfMessagesVisible"
  dimensions          = { QueueName = aws_sqs_queue.processing.name }
  comparison_operator = "GreaterThanThreshold"
  threshold           = 2
  evaluation_periods  = 1
  period              = 60
  statistic           = "Maximum"
  alarm_actions       = [aws_appautoscaling_policy.worker_scale_out.arn]
}

resource "aws_appautoscaling_policy" "worker_scale_out" {
  name               = "${var.project_name}-worker-scale-out"
  service_namespace  = "ecs"
  resource_id        = aws_appautoscaling_target.worker.resource_id
  scalable_dimension = aws_appautoscaling_target.worker.scalable_dimension
  policy_type        = "StepScaling"

  step_scaling_policy_configuration {
    adjustment_type          = "ChangeInCapacity"
    cooldown                 = 120   # 2 min — worker needs time to start and pull from ECR
    metric_aggregation_type  = "Maximum"

    step_adjustment {
      metric_interval_lower_bound = 0
      scaling_adjustment          = 1   # add 1 worker when queue > 2 messages
    }
  }
}

# Scale IN alarm: queue empty for 5 min → remove a worker
resource "aws_cloudwatch_metric_alarm" "worker_scale_in" {
  alarm_name          = "${var.project_name}-worker-scale-in"
  namespace           = "AWS/SQS"
  metric_name         = "ApproximateNumberOfMessagesVisible"
  dimensions          = { QueueName = aws_sqs_queue.processing.name }
  comparison_operator = "LessThanOrEqualToThreshold"
  threshold           = 0
  evaluation_periods  = 5    # 5 consecutive periods of 0 messages
  period              = 60
  statistic           = "Maximum"
  alarm_actions       = [aws_appautoscaling_policy.worker_scale_in.arn]
}

resource "aws_appautoscaling_policy" "worker_scale_in" {
  name               = "${var.project_name}-worker-scale-in"
  service_namespace  = "ecs"
  resource_id        = aws_appautoscaling_target.worker.resource_id
  scalable_dimension = aws_appautoscaling_target.worker.scalable_dimension
  policy_type        = "StepScaling"

  step_scaling_policy_configuration {
    adjustment_type          = "ChangeInCapacity"
    cooldown                 = 300
    metric_aggregation_type  = "Maximum"

    step_adjustment {
      metric_interval_upper_bound = 0
      scaling_adjustment          = -1   # remove 1 worker when queue is empty
    }
  }
}

# ─── CloudWatch Alarm: DLQ depth ──────────────────────────────────────────────
# Alert when any message reaches the Dead Letter Queue (= 3 failed processing attempts).

resource "aws_cloudwatch_metric_alarm" "dlq_depth" {
  alarm_name          = "${var.project_name}-dlq-not-empty"
  namespace           = "AWS/SQS"
  metric_name         = "ApproximateNumberOfMessagesVisible"
  dimensions          = { QueueName = aws_sqs_queue.processing_dlq.name }
  comparison_operator = "GreaterThanThreshold"
  threshold           = 0
  evaluation_periods  = 1
  period              = 60
  statistic           = "Maximum"
  # In production: add SNS action for email/PagerDuty alert
  # alarm_actions = [aws_sns_topic.alerts.arn]
  tags = { Project = var.project_name }
}

# ─── CodeBuild Projects ───────────────────────────────────────────────────────

resource "aws_codebuild_project" "api" {
  name          = "${var.project_name}-api-build"
  service_role  = aws_iam_role.codebuild.arn
  build_timeout = 20   # minutes

  artifacts { type = "NO_ARTIFACTS" }

  environment {
    type            = "LINUX_CONTAINER"
    compute_type    = "BUILD_GENERAL1_SMALL"
    image           = "aws/codebuild/standard:7.0"
    privileged_mode = true   # required for docker build
  }

  source {
    type      = "NO_SOURCE"
    buildspec = file("${path.module}/../buildspec-api.yml")
  }

  tags = { Project = var.project_name }
}

resource "aws_codebuild_project" "worker" {
  name          = "${var.project_name}-worker-build"
  service_role  = aws_iam_role.codebuild.arn
  build_timeout = 20

  artifacts { type = "NO_ARTIFACTS" }

  environment {
    type            = "LINUX_CONTAINER"
    compute_type    = "BUILD_GENERAL1_SMALL"
    image           = "aws/codebuild/standard:7.0"
    privileged_mode = true
  }

  source {
    type      = "NO_SOURCE"
    buildspec = file("${path.module}/../buildspec-worker.yml")
  }

  tags = { Project = var.project_name }
}
