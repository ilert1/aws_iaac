output "cloudfront_distribution_id" {
  description = "CloudFront Distribution ID (use for cache invalidation)"
  value       = aws_cloudfront_distribution.website.id
}

output "website_bucket_name" {
  description = "S3 bucket name for website assets"
  value       = aws_s3_bucket.website.bucket
}
