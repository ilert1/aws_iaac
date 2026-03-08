variable "api_url" {
  description = "Full API custom domain (e.g. api.example.com)"
  type        = string
}

variable "certificate_arn" {
  description = "ACM certificate ARN (must be in us-east-1 for EDGE endpoint)"
  type        = string
}

variable "zone_id" {
  description = "Route53 hosted zone ID"
  type        = string
}

variable "user_pool_arn" {
  description = "Cognito User Pool ARN for the authorizer"
  type        = string
}

variable "translate_invoke_arn" {
  type = string
}

variable "translate_function_name" {
  type = string
}

variable "get_translations_invoke_arn" {
  type = string
}

variable "get_translations_function_name" {
  type = string
}

variable "delete_translation_invoke_arn" {
  type = string
}

variable "delete_translation_function_name" {
  type = string
}

variable "public_translate_invoke_arn" {
  type = string
}

variable "public_translate_function_name" {
  type = string
}
