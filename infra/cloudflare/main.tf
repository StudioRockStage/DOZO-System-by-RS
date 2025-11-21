terraform {
  required_version = ">= 1.0"
  
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# R2 Bucket for DOZO updates storage
resource "cloudflare_r2_bucket" "dozo_updates" {
  account_id = var.cloudflare_account_id
  name       = var.r2_bucket_name
  location   = "auto"
}

# Cloudflare Worker Script
resource "cloudflare_worker_script" "dozo_updates_worker" {
  account_id = var.cloudflare_account_id
  name       = var.worker_script_name
  content    = file("${path.module}/worker.js")

  r2_bucket_binding {
    name        = "DOZO_BUCKET"
    bucket_name = cloudflare_r2_bucket.dozo_updates.name
  }
}

# Worker Route - Route subdomain to worker
resource "cloudflare_worker_route" "dozo_updates_route" {
  zone_id     = var.cloudflare_zone_id
  pattern     = "${var.subdomain}.${var.domain}/*"
  script_name = cloudflare_worker_script.dozo_updates_worker.name
}

# DNS Record for subdomain
# Note: Worker routes with custom domain patterns automatically handle DNS routing.
# This explicit DNS record ensures the subdomain resolves, though the route may handle it automatically.
# Using CNAME pointing to root domain ensures proper resolution.
resource "cloudflare_record" "dozo_updates_dns" {
  zone_id = var.cloudflare_zone_id
  name    = var.subdomain
  type    = "CNAME"
  content = var.domain  # Points to root domain, worker route handles the routing
  proxied = true
  comment = "DOZO System Updates Endpoint - Routed via Worker"
}

# Outputs
output "r2_bucket_name" {
  description = "Name of the created R2 bucket"
  value       = cloudflare_r2_bucket.dozo_updates.name
}

output "worker_name" {
  description = "Name of the Cloudflare Worker"
  value       = cloudflare_worker_script.dozo_updates_worker.name
}

output "endpoint_url" {
  description = "URL of the updates endpoint"
  value       = "https://${var.subdomain}.${var.domain}"
}

output "r2_bucket_public_url" {
  description = "Public URL pattern for R2 bucket (requires custom domain)"
  value       = "https://${var.subdomain}.${var.domain}"
}

