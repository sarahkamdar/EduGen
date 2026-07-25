variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Project name — used as a prefix for all resource names"
  type        = string
  default     = "edugen"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "prod"
}

# ─── DocumentDB ───────────────────────────────────────────────────────────────
variable "docdb_master_username" {
  description = "DocumentDB master username"
  type        = string
  default     = "edugen_user"
}

variable "docdb_master_password" {
  description = "DocumentDB master password — do NOT commit this, pass via TF_VAR_docdb_master_password"
  type        = string
  sensitive   = true
}

variable "docdb_instance_class" {
  description = "DocumentDB instance type (smallest = db.t3.medium)"
  type        = string
  default     = "db.t3.medium"
}

# ─── ECS ──────────────────────────────────────────────────────────────────────
variable "api_cpu" {
  description = "CPU units for API task (1024 = 1 vCPU)"
  type        = number
  default     = 512   # 0.5 vCPU — enough for FastAPI with 2 workers
}

variable "api_memory" {
  description = "Memory (MB) for API task"
  type        = number
  default     = 1024  # 1 GB
}

variable "worker_cpu" {
  description = "CPU units for Worker task"
  type        = number
  default     = 1024  # 1 vCPU — ffmpeg is CPU-intensive
}

variable "worker_memory" {
  description = "Memory (MB) for Worker task"
  type        = number
  default     = 2048  # 2 GB — ffmpeg + Whisper need headroom
}

variable "api_desired_count" {
  description = "Initial number of API ECS tasks"
  type        = number
  default     = 1
}

variable "worker_desired_count" {
  description = "Initial number of Worker ECS tasks"
  type        = number
  default     = 1
}

# ─── Auto-scaling limits ──────────────────────────────────────────────────────
variable "api_max_count" {
  type    = number
  default = 4
}

variable "worker_max_count" {
  type    = number
  default = 3
}

# ─── Secrets (stored in SSM Parameter Store) ─────────────────────────────────
# Pass these via environment:
#   export TF_VAR_groq_api_key=gsk_...
#   export TF_VAR_jwt_secret=...
#   export TF_VAR_mongodb_uri=...  (after DocumentDB is created)

variable "groq_api_key" {
  type      = string
  sensitive = true
  default   = ""
}

variable "jwt_secret" {
  type      = string
  sensitive = true
  default   = ""
}

variable "mongodb_uri" {
  description = "Full MongoDB/DocumentDB connection string"
  type        = string
  sensitive   = true
  default     = ""
}
