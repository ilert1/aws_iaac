output "user_pool_id" {
  description = "Cognito User Pool ID"
  value       = module.cognito.user_pool_id
}

output "user_pool_client_id" {
  description = "Cognito User Pool Client ID"
  value       = module.cognito.user_pool_client_id
}

output "api_endpoint" {
  description = "API Gateway custom domain endpoint"
  value       = module.api_gateway.api_endpoint
}

output "website_url" {
  description = "Website URL"
  value       = "https://${local.web_url}"
}

output "cloudfront_distribution_id" {
  description = "CloudFront Distribution ID (use for cache invalidation on deploy)"
  value       = module.static_website.cloudfront_distribution_id
}

output "website_bucket_name" {
  description = "S3 bucket name for website assets"
  value       = module.static_website.website_bucket_name
}
