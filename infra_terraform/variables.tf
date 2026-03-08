variable "aws_account_id" {
  description = "AWS Account ID"
  type        = string
}

variable "aws_region" {
  description = "Primary AWS region for deployed resources"
  type        = string
  default     = "us-east-1"
}

variable "domain" {
  description = "Root domain name (e.g., translateappdemo.site)"
  type        = string
}

variable "api_subdomain" {
  description = "Subdomain for the API Gateway custom domain"
  type        = string
  default     = "api"
}

variable "web_subdomain" {
  description = "Subdomain for the web application (www)"
  type        = string
  default     = "www"
}
