variable "cloudflare_api_token" {
  description = "Cloudflare API Token with permissions for R2, Workers, and DNS"
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "Cloudflare Account ID"
  type        = string
}

variable "cloudflare_zone_id" {
  description = "Cloudflare Zone ID for rockstage.mx domain"
  type        = string
}

variable "r2_bucket_name" {
  description = "Name of the R2 bucket for DOZO updates"
  type        = string
  default     = "dozo-updates"
}

variable "worker_script_name" {
  description = "Name of the Cloudflare Worker script"
  type        = string
  default     = "dozo-updates-worker"
}

variable "subdomain" {
  description = "Subdomain for the updates endpoint"
  type        = string
  default     = "updates"
}

variable "domain" {
  description = "Root domain"
  type        = string
  default     = "rockstage.mx"
}


