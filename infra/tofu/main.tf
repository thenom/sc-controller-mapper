locals {
  # Split owner and repository name from the "owner/repo" input
  repo_parts = split("/", var.github_repo)
  repo_owner = local.repo_parts[0]
  repo_name  = local.repo_parts[1]

  # Descriptive string representing current rollout state for outputs and debugging
  rollout_stage = !var.enable_zero_trust ? "Stage 3: Public Launch (Access Gating Disabled)" : (
    nonsensitive(length(var.allowed_emails) > 0) ? "Stage 2B: Semi-Private Beta (IP Whitelist + Email OTP Allowlist)" :
    "Stage 2A: Private Alpha (Strict IP Whitelist Only)"
  )
}

# ==============================================================================
# 1. Cloudflare Pages Project
# ==============================================================================
# Connects to the GitHub repository and triggers builds on push to the main branch.
# Monorepo build commands compile TypeScript packages before Vite produces the web bundle.
resource "cloudflare_pages_project" "app" {
  account_id        = var.cloudflare_account_id
  name              = var.project_name
  production_branch = var.production_branch

  source {
    type = "github"
    config {
      owner                         = local.repo_owner
      repo_name                     = local.repo_name
      production_branch             = var.production_branch
      pr_comments_enabled           = true
      deployments_enabled           = true
      production_deployment_enabled = true
      preview_deployment_setting    = "all"
    }
  }

  build_config {
    build_command   = var.build_command
    destination_dir = var.build_output_directory
    root_dir        = var.root_directory
  }

  deployment_configs {
    preview {
      environment_variables = {
        NODE_VERSION           = "22"
        VITE_MONETIZATION_MODE = "test"
      }
    }
    production {
      environment_variables = {
        NODE_VERSION           = "22"
        VITE_MONETIZATION_MODE = var.enable_zero_trust ? "test" : "live"
      }
    }
  }
}

# ==============================================================================
# 2. Custom Domain & DNS CNAME Mapping
# ==============================================================================
# Attach the custom domain (scbind.com or a subdomain) to the Pages project
resource "cloudflare_pages_domain" "custom_domain" {
  account_id   = var.cloudflare_account_id
  project_name = cloudflare_pages_project.app.name
  domain       = var.custom_domain
}

# Configure proxied DNS CNAME record pointing custom_domain to <project>.pages.dev.
# For apex domains (scbind.com), Cloudflare proxy automatically provides CNAME flattening.
resource "cloudflare_record" "pages_cname" {
  zone_id = var.cloudflare_zone_id
  name    = var.custom_domain
  content = "${cloudflare_pages_project.app.name}.pages.dev"
  type    = "CNAME"
  proxied = true
  ttl     = 1 # Automatic when proxied

  comment = "Managed by OpenTofu: Pages CNAME for ${cloudflare_pages_project.app.name}"

  depends_on = [
    cloudflare_pages_domain.custom_domain
  ]
}

# ==============================================================================
# 3. Gated Access & Staged Rollout (Cloudflare Zero Trust)
# ==============================================================================
# Cloudflare Access Application protecting the custom domain.
# When var.enable_zero_trust = false (Public Launch), this resource and its policy
# are destroyed, allowing unrestricted public traffic.
resource "cloudflare_zero_trust_access_application" "pages_app" {
  count            = var.enable_zero_trust ? 1 : 0
  account_id       = var.cloudflare_account_id
  name             = "${var.project_name} Staged Access Gate"
  domain           = var.custom_domain
  type             = "self_hosted"
  session_duration = var.session_duration
}

# Staged Access Policy:
# - Stage 2A: IP Whitelist — allows seamless access from your public IP / initial tester IPs.
# - Stage 2B: Email Allowlist — permits invited friends to authenticate via Cloudflare Access
#   One-Time PIN (OTP) without needing static IP addresses.
#
# Cloudflare Access combines multiple 'include' blocks using OR logic:
# A visitor is granted access if their IP matches 'allowed_ips' OR they authenticate
# with an email in 'allowed_emails'.
resource "cloudflare_zero_trust_access_policy" "staged_access" {
  count          = var.enable_zero_trust ? 1 : 0
  account_id     = var.cloudflare_account_id
  application_id = cloudflare_zero_trust_access_application.pages_app[0].id
  name           = "${var.project_name} Staged Access Policy"
  decision       = "allow"
  precedence     = 1

  # Stage 2A: IP Whitelist selector
  dynamic "include" {
    for_each = length(var.allowed_ips) > 0 ? [1] : []
    content {
      ip = var.allowed_ips
    }
  }

  # Stage 2B: Email OTP Allowlist selector
  dynamic "include" {
    for_each = length(var.allowed_emails) > 0 ? [1] : []
    content {
      email = var.allowed_emails
    }
  }

  lifecycle {
    precondition {
      condition     = !var.enable_zero_trust || length(var.allowed_ips) > 0 || length(var.allowed_emails) > 0
      error_message = "When enable_zero_trust is true, at least one IP in allowed_ips or one email in allowed_emails must be configured."
    }
  }
}
