variable "domain" {
  description = "Root domain name"
  type        = string
}

variable "web_url" {
  description = "Full web subdomain URL (e.g. www.example.com)"
  type        = string
}

variable "api_url" {
  description = "Full API subdomain URL (e.g. api.example.com)"
  type        = string
}

variable "zone_id" {
  description = "Route53 hosted zone ID for DNS validation records"
  type        = string
}
