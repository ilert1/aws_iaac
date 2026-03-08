terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
    null = {
      source  = "hashicorp/null"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# CloudFront and EDGE-optimized API Gateway certificates must be in us-east-1
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

locals {
  web_url = "${var.web_subdomain}.${var.domain}"
  api_url = "${var.api_subdomain}.${var.domain}"
}

# ── Modules ───────────────────────────────────────────────────────────────────

module "certificate" {
  source = "./modules/certificate"

  providers = {
    aws           = aws
    aws.us_east_1 = aws.us_east_1
  }

  domain  = var.domain
  web_url = local.web_url
  api_url = local.api_url
  zone_id = data.aws_route53_zone.zone.zone_id
}

module "cognito" {
  source = "./modules/cognito"
}

module "translation_service" {
  source = "./modules/translation_service"
}

module "api_gateway" {
  source = "./modules/api_gateway"

  api_url         = local.api_url
  certificate_arn = module.certificate.certificate_arn
  zone_id         = data.aws_route53_zone.zone.zone_id
  user_pool_arn   = module.cognito.user_pool_arn

  translate_invoke_arn             = module.translation_service.translate_invoke_arn
  translate_function_name          = module.translation_service.translate_function_name
  get_translations_invoke_arn      = module.translation_service.get_translations_invoke_arn
  get_translations_function_name   = module.translation_service.get_translations_function_name
  delete_translation_invoke_arn    = module.translation_service.delete_translation_invoke_arn
  delete_translation_function_name = module.translation_service.delete_translation_function_name
  public_translate_invoke_arn      = module.translation_service.public_translate_invoke_arn
  public_translate_function_name   = module.translation_service.public_translate_function_name
}

module "static_website" {
  source = "./modules/static_website"

  domain          = var.domain
  web_url         = local.web_url
  certificate_arn = module.certificate.certificate_arn
  zone_id         = data.aws_route53_zone.zone.zone_id
}
