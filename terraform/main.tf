terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Remote state in S3 — run `terraform init` after creating this bucket manually.
  # Bucket name must be globally unique; change to your own.
  backend "s3" {
    bucket = "edugen-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "ap-south-1"
  }
}

provider "aws" {
  region = var.aws_region
}

# ─── DATA SOURCES ─────────────────────────────────────────────────────────────

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# Use the default VPC to keep costs minimal (no NAT gateway needed for demo)
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# ─── LOCALS ───────────────────────────────────────────────────────────────────

locals {
  account_id = data.aws_caller_identity.current.account_id
  region     = data.aws_region.current.name
  ecr_base   = "${local.account_id}.dkr.ecr.${local.region}.amazonaws.com"
}
