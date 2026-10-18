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

  source = {
    type = "github"
    config = {
      owner                          = local.repo_owner
      repo_name                      = local.repo_name
      production_branch              = var.production_branch
      pr_comments_enabled            = true
      production_deployments_enabled = true
      preview_deployment_setting     = "all"
    }
  }

  build_config = {
    build_command   = var.build_command
    destination_dir = var.build_output_directory
    root_dir        = var.root_directory
  }

  deployment_configs = {
    preview = {
      env_vars = {
        NODE_VERSION = {
          type  = "plain_text"
          value = var.node_version
        }
        VITE_MONETIZATION_MODE = {
          type  = "plain_text"
          value = "test"
        }
        VITE_SUPPORTER_URL = {
          type  = "plain_text"
          value = var.supporter_url
        }
        VITE_AFFILIATE_AMAZON_TAG = {
          type  = "plain_text"
          value = var.affiliate_amazon_tag
        }
      }
    }
    production = {
      env_vars = {
        NODE_VERSION = {
          type  = "plain_text"
          value = var.node_version
        }
        VITE_MONETIZATION_MODE = {
          type  = "plain_text"
          value = var.monetization_mode != "" ? var.monetization_mode : (var.enable_zero_trust ? "test" : "live")
        }
        VITE_SUPPORTER_URL = {
          type  = "plain_text"
          value = var.supporter_url
        }
        VITE_AFFILIATE_AMAZON_TAG = {
          type  = "plain_text"
          value = var.affiliate_amazon_tag
        }
        VITE_ADSENSE_CLIENT_ID = {
          type  = "plain_text"
          value = var.adsense_client_id
        }
        VITE_ADSENSE_SLOT_ID = {
          type  = "plain_text"
          value = var.adsense_slot_id
        }
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
  name         = var.custom_domain
}

# Configure proxied DNS CNAME record pointing custom_domain to <project>.pages.dev.
# For apex domains (scbind.com), Cloudflare proxy automatically provides CNAME flattening.
resource "cloudflare_dns_record" "pages_cname" {
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
#
# Staged Access Policy:
# - Stage 2A: IP Whitelist — allows seamless access from your public IP / initial tester IPs.
# - Stage 2B: Email Allowlist — permits invited friends to authenticate via Cloudflare Access
#   One-Time PIN (OTP) without needing static IP addresses.
#
# Cloudflare Access evaluates multiple 'include' entries using OR logic:
# A visitor is granted access if their IP matches 'allowed_ips' OR they authenticate
# with an email in 'allowed_emails'.
resource "cloudflare_zero_trust_access_application" "pages_app" {
  count            = var.enable_zero_trust ? 1 : 0
  account_id       = var.cloudflare_account_id
  name             = "${var.project_name} Staged Access Gate"
  domain           = var.custom_domain
  type             = "self_hosted"
  session_duration = var.session_duration

  policies = [
    {
      name       = "${var.project_name} Staged Access Policy"
      decision   = "allow"
      precedence = 1
      include = concat(
        [for ip in var.allowed_ips : { ip = { ip = ip } }],
        [for email in var.allowed_emails : { email = { email = email } }]
      )
    }
  ]

  lifecycle {
    precondition {
      condition     = !var.enable_zero_trust || length(var.allowed_ips) > 0 || length(var.allowed_emails) > 0
      error_message = "When enable_zero_trust is true, at least one IP in allowed_ips or one email in allowed_emails must be configured."
    }
  }
}
