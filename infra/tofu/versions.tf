terraform {
  required_version = ">= 1.6.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.52"
    }
  }

  # Maintain strictly local state per project architectural invariant
  backend "local" {
    path = "tofu.tfstate"
  }
}

provider "cloudflare" {
  # Authentication is handled securely via the CLOUDFLARE_API_TOKEN environment variable.
}
