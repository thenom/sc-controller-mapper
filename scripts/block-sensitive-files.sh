#!/usr/bin/env bash
# ==============================================================================
# Security Gate: Prevent sensitive files from being committed to Git
# ==============================================================================
set -euo pipefail

# Regex patterns of forbidden sensitive files
SENSITIVE_PATTERN='(\.tfstate|\.tfstate\.backup|tofu\.tfstate.*|terraform\.tfstate.*|\.tfvars|\.tfvars\.json|\.auto\.tfvars|\.auto\.tfvars\.json|\.env|\.env\..*|\.key|\.pem|\.p12|\.pfx|\.pkcs12|credentials\.json|service-account.*\.json|id_rsa|id_ed25519)$'

# Whitelist safe template / example files
SAFE_PATTERN='(\.example|\.sample|\.template)$'

exit_code=0

for file in "$@"; do
  # Check if file matches sensitive pattern
  if [[ "$file" =~ $SENSITIVE_PATTERN ]]; then
    # Allow safe examples / templates (e.g. terraform.tfvars.example, .env.example)
    if [[ ! "$file" =~ $SAFE_PATTERN ]]; then
      echo "❌ SECURITY ALERT: Attempted to commit forbidden sensitive file:" >&2
      echo "   --> $file" >&2
      echo "   Sensitive files (credentials, private keys, .tfvars, .tfstate, .env) must NEVER be committed to Git." >&2
      exit_code=1
    fi
  fi
done

exit $exit_code
