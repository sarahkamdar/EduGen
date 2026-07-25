output "alb_dns_name" {
  description = "ALB DNS name — set this as VITE_API_BASE_URL in GitHub Secrets"
  value       = "http://${aws_lb.main.dns_name}"
}

output "cloudfront_domain" {
  description = "CloudFront URL for the frontend — share this with users"
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

output "cloudfront_distribution_id" {
  description = "CloudFront Distribution ID — set as CLOUDFRONT_DISTRIBUTION_ID in GitHub Secrets"
  value       = aws_cloudfront_distribution.frontend.id
}

output "ecr_api_uri" {
  description = "ECR URI for the API image — used in buildspec-api.yml"
  value       = aws_ecr_repository.api.repository_url
}

output "ecr_worker_uri" {
  description = "ECR URI for the worker image — used in buildspec-worker.yml"
  value       = aws_ecr_repository.worker.repository_url
}

output "documentdb_endpoint" {
  description = "DocumentDB cluster endpoint — use in MONGODB_URI SSM parameter"
  value       = aws_docdb_cluster.main.endpoint
}

output "sqs_queue_url" {
  description = "SQS queue URL — set as SQS_QUEUE_URL in SSM or task env"
  value       = aws_sqs_queue.processing.url
}

output "frontend_s3_bucket" {
  description = "S3 bucket name for frontend — used in GitHub Actions deploy"
  value       = aws_s3_bucket.frontend.bucket
}

output "github_actions_access_key_id" {
  description = "AWS_ACCESS_KEY_ID for GitHub Actions — add to GitHub Secrets"
  value       = aws_iam_access_key.github_actions.id
  sensitive   = false
}

output "github_actions_secret_access_key" {
  description = "AWS_SECRET_ACCESS_KEY for GitHub Actions — add to GitHub Secrets (sensitive)"
  value       = aws_iam_access_key.github_actions.secret
  sensitive   = true
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.main.name
}

output "ecs_api_service_name" {
  value = aws_ecs_service.api.name
}

output "ecs_worker_service_name" {
  value = aws_ecs_service.worker.name
}

output "codebuild_api_project" {
  value = aws_codebuild_project.api.name
}

output "codebuild_worker_project" {
  value = aws_codebuild_project.worker.name
}
