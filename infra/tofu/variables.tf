variable "cloudflare_account_id" {
  description = "Cloudflare Account ID (found on the right sidebar of the Cloudflare dashboard overview page)."
  type        = string
  sensitive   = true
}

variable "cloudflare_zone_id" {
  description = "Cloudflare Zone ID for the domain (found on the overview page for scbind.com in Cloudflare DNS)."
  type        = string
  sensitive   = true
}

variable "custom_domain" {
  description = "Custom domain or subdomain to bind to the Cloudflare Pages application (e.g. scbind.com or app.scbind.com)."
  type        = string
  default     = "scbind.com"
}

variable "project_name" {
  description = "Name of the Cloudflare Pages project (will form the default <project_name>.pages.dev domain)."
  type        = string
  default     = "sc-controller-mapper"
}

variable "github_repo" {
  description = "GitHub repository in 'owner/repo' format."
  type        = string
  default     = "thenom/sc-controller-mapper"

  validation {
    condition     = can(regex("^[a-zA-Z0-9_.-]+/[a-zA-Z0-9_.-]+$", var.github_repo))
    error_message = "github_repo must be formatted as 'owner/repo' (e.g. 'thenom/sc-controller-mapper')."
  }
}

variable "production_branch" {
  description = "Branch name to trigger production deployments on Cloudflare Pages."
  type        = string
  default     = "main"
}

variable "build_command" {
  description = "Build command executed by Cloudflare Pages build environment."
  type        = string
  default     = "npm run build"
}

variable "build_output_directory" {
  description = "Directory containing compiled static assets relative to repo root (apps/web/dist for Vite monorepo)."
  type        = string
  default     = "apps/web/dist"
}

variable "root_directory" {
  description = "Working directory for the build relative to repository root (blank string for monorepo root)."
  type        = string
  default     = ""
}

variable "enable_zero_trust" {
  description = "Toggle Cloudflare Zero Trust Access gate on/off. Set to false when ready for public launch."
  type        = bool
  default     = true
}

variable "session_duration" {
  description = "Session duration for authenticated Cloudflare Zero Trust Access sessions."
  type        = string
  default     = "24h"
}

variable "allowed_ips" {
  description = "List of IPv4/IPv6 CIDR addresses permitted to access the application during staged rollout (e.g. ['203.0.113.42/32'])."
  type        = list(string)
  default     = []
  sensitive   = true
}

variable "allowed_emails" {
  description = "List of email addresses permitted to authenticate via Cloudflare Access One-Time PIN (OTP) during friend/tester beta rollout."
  type        = list(string)
  default     = []
  sensitive   = true
}
