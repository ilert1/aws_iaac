variable "domain" {
  description = "Root domain name"
  type        = string
}

variable "web_url" {
  description = "Full web subdomain URL (e.g. www.example.com)"
  type        = string
}

variable "certificate_arn" {
  description = "ACM certificate ARN (must be in us-east-1 for CloudFront)"
  type        = string
}

variable "zone_id" {
  description = "Route53 hosted zone ID"
  type        = string
}
