output "pages_project_id" {
  description = "The ID of the Cloudflare Pages project."
  value       = cloudflare_pages_project.app.id
}

output "pages_project_name" {
  description = "The configured name of the Cloudflare Pages project."
  value       = cloudflare_pages_project.app.name
}

output "pages_default_subdomain" {
  description = "The default *.pages.dev URL for the project."
  value       = "https://${cloudflare_pages_project.app.name}.pages.dev"
}

output "custom_domain_url" {
  description = "The live custom domain URL."
  value       = "https://${var.custom_domain}"
}

output "dns_record_id" {
  description = "The ID of the proxied DNS CNAME record."
  value       = cloudflare_record.pages_cname.id
}

output "dns_record_hostname" {
  description = "The fully-qualified hostname configured in DNS."
  value       = cloudflare_record.pages_cname.hostname
}

output "zero_trust_enabled" {
  description = "Whether Cloudflare Zero Trust Access protection is currently active."
  value       = var.enable_zero_trust
}

output "zero_trust_application_id" {
  description = "The Cloudflare Zero Trust Access Application ID (null when Access gate is disabled)."
  value       = try(cloudflare_zero_trust_access_application.pages_app[0].id, null)
}

output "zero_trust_audience_tag" {
  description = "The Application Audience (AUD) tag for verifying Access JWTs."
  value       = try(cloudflare_zero_trust_access_application.pages_app[0].aud, null)
}

output "staged_rollout_stage" {
  description = "Current stage in the phased rollout progression."
  value       = local.rollout_stage
}
