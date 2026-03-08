locals {
  frontend_dist = "${path.root}/../apps/frontend/dist"
}

# ── S3 bucket ─────────────────────────────────────────────────────────────────

resource "aws_s3_bucket" "website" {
  bucket        = "${var.domain}-website"
  force_destroy = true
}

resource "aws_s3_bucket_website_configuration" "website" {
  bucket = aws_s3_bucket.website.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "404.html"
  }
}

resource "aws_s3_bucket_public_access_block" "website" {
  bucket = aws_s3_bucket.website.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "public_read" {
  bucket     = aws_s3_bucket.website.id
  depends_on = [aws_s3_bucket_public_access_block.website]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "PublicReadGetObject"
      Effect    = "Allow"
      Principal = "*"
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.website.arn}/*"
    }]
  })
}

# ── CloudFront distribution ───────────────────────────────────────────────────

resource "aws_cloudfront_distribution" "website" {
  enabled             = true
  default_root_object = "index.html"
  aliases             = [var.domain, var.web_url]

  viewer_certificate {
    acm_certificate_arn      = var.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  origin {
    origin_id   = "S3WebsiteOrigin"
    domain_name = aws_s3_bucket_website_configuration.website.website_endpoint

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    target_origin_id       = "S3WebsiteOrigin"
    viewer_protocol_policy = "redirect-to-https"

    allowed_methods = ["GET", "HEAD", "OPTIONS"]
    cached_methods  = ["GET", "HEAD"]

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 3600
    max_ttl     = 86400
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
}

# ── Route53 A records ─────────────────────────────────────────────────────────

resource "aws_route53_record" "root" {
  zone_id = var.zone_id
  name    = var.domain
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.website.domain_name
    zone_id                = aws_cloudfront_distribution.website.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www" {
  zone_id = var.zone_id
  name    = var.web_url
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.website.domain_name
    zone_id                = aws_cloudfront_distribution.website.hosted_zone_id
    evaluate_target_health = false
  }
}

# ── Frontend deployment ───────────────────────────────────────────────────────

resource "null_resource" "deploy_website" {
  triggers = {
    dist_hash = sha1(join("", [
      for f in sort(fileset(local.frontend_dist, "**/*")) :
      filemd5("${local.frontend_dist}/${f}")
    ]))
    distribution_id = aws_cloudfront_distribution.website.id
  }

  provisioner "local-exec" {
    command = <<-EOT
      aws s3 sync "${local.frontend_dist}" "s3://${aws_s3_bucket.website.bucket}" --delete
      aws cloudfront create-invalidation \
        --distribution-id "${aws_cloudfront_distribution.website.id}" \
        --paths "/*"
    EOT
    interpreter = ["bash", "-c"]
  }

  depends_on = [aws_cloudfront_distribution.website]
}
