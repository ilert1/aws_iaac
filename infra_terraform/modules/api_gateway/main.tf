# ── REST API ──────────────────────────────────────────────────────────────────

resource "aws_api_gateway_rest_api" "api" {
  name = "translateRestApi"

  endpoint_configuration {
    types = ["EDGE"]
  }
}

# ── Resources ─────────────────────────────────────────────────────────────────

resource "aws_api_gateway_resource" "public" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "public"
}

resource "aws_api_gateway_resource" "user" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "user"
}

# ── Cognito authorizer ────────────────────────────────────────────────────────

resource "aws_api_gateway_authorizer" "cognito" {
  name            = "userPoolAuthorizer"
  rest_api_id     = aws_api_gateway_rest_api.api.id
  type            = "COGNITO_USER_POOLS"
  identity_source = "method.request.header.Authorization"
  provider_arns   = [var.user_pool_arn]
}

# ── CORS header definitions ───────────────────────────────────────────────────

locals {
  cors_response_parameters = {
    "method.response.header.Access-Control-Allow-Headers"     = true
    "method.response.header.Access-Control-Allow-Methods"     = true
    "method.response.header.Access-Control-Allow-Origin"      = true
    "method.response.header.Access-Control-Allow-Credentials" = true
  }

  cors_integration_values = {
    "method.response.header.Access-Control-Allow-Headers"     = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Requested-With'"
    "method.response.header.Access-Control-Allow-Methods"     = "'GET,HEAD,POST,DELETE,PUT,PATCH,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"      = "'*'"
    "method.response.header.Access-Control-Allow-Credentials" = "'true'"
  }
}

# ── /public OPTIONS (CORS preflight) ─────────────────────────────────────────

resource "aws_api_gateway_method" "public_options" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.public.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "public_options" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.public.id
  http_method = aws_api_gateway_method.public_options.http_method
  type        = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "public_options_200" {
  rest_api_id         = aws_api_gateway_rest_api.api.id
  resource_id         = aws_api_gateway_resource.public.id
  http_method         = aws_api_gateway_method.public_options.http_method
  status_code         = "200"
  response_parameters = local.cors_response_parameters
}

resource "aws_api_gateway_integration_response" "public_options" {
  rest_api_id         = aws_api_gateway_rest_api.api.id
  resource_id         = aws_api_gateway_resource.public.id
  http_method         = aws_api_gateway_method.public_options.http_method
  status_code         = aws_api_gateway_method_response.public_options_200.status_code
  response_parameters = local.cors_integration_values
  depends_on          = [aws_api_gateway_integration.public_options]
}

# ── /public POST — publicTranslate (no auth) ─────────────────────────────────

resource "aws_api_gateway_method" "public_post" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.public.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "public_post" {
  rest_api_id             = aws_api_gateway_rest_api.api.id
  resource_id             = aws_api_gateway_resource.public.id
  http_method             = aws_api_gateway_method.public_post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.public_translate_invoke_arn
}

resource "aws_lambda_permission" "public_translate" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.public_translate_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.api.execution_arn}/*/*"
}

# ── /user OPTIONS (CORS preflight) ───────────────────────────────────────────

resource "aws_api_gateway_method" "user_options" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.user.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "user_options" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.user.id
  http_method = aws_api_gateway_method.user_options.http_method
  type        = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "user_options_200" {
  rest_api_id         = aws_api_gateway_rest_api.api.id
  resource_id         = aws_api_gateway_resource.user.id
  http_method         = aws_api_gateway_method.user_options.http_method
  status_code         = "200"
  response_parameters = local.cors_response_parameters
}

resource "aws_api_gateway_integration_response" "user_options" {
  rest_api_id         = aws_api_gateway_rest_api.api.id
  resource_id         = aws_api_gateway_resource.user.id
  http_method         = aws_api_gateway_method.user_options.http_method
  status_code         = aws_api_gateway_method_response.user_options_200.status_code
  response_parameters = local.cors_integration_values
  depends_on          = [aws_api_gateway_integration.user_options]
}

# ── /user POST — userTranslate (Cognito auth) ────────────────────────────────

resource "aws_api_gateway_method" "user_post" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.user.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "user_post" {
  rest_api_id             = aws_api_gateway_rest_api.api.id
  resource_id             = aws_api_gateway_resource.user.id
  http_method             = aws_api_gateway_method.user_post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.translate_invoke_arn
}

resource "aws_lambda_permission" "translate" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.translate_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.api.execution_arn}/*/*"
}

# ── /user GET — getUserTranslations (Cognito auth) ───────────────────────────

resource "aws_api_gateway_method" "user_get" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.user.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "user_get" {
  rest_api_id             = aws_api_gateway_rest_api.api.id
  resource_id             = aws_api_gateway_resource.user.id
  http_method             = aws_api_gateway_method.user_get.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.get_translations_invoke_arn
}

resource "aws_lambda_permission" "get_translations" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.get_translations_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.api.execution_arn}/*/*"
}

# ── /user DELETE — deleteTranslation (Cognito auth) ──────────────────────────

resource "aws_api_gateway_method" "user_delete" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.user.id
  http_method   = "DELETE"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "user_delete" {
  rest_api_id             = aws_api_gateway_rest_api.api.id
  resource_id             = aws_api_gateway_resource.user.id
  http_method             = aws_api_gateway_method.user_delete.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.delete_translation_invoke_arn
}

resource "aws_lambda_permission" "delete_translation" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.delete_translation_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.api.execution_arn}/*/*"
}

# ── Deployment & Stage ────────────────────────────────────────────────────────

resource "aws_api_gateway_deployment" "api" {
  rest_api_id = aws_api_gateway_rest_api.api.id

  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.public.id,
      aws_api_gateway_resource.user.id,
      aws_api_gateway_method.public_options.id,
      aws_api_gateway_method.public_post.id,
      aws_api_gateway_method.user_options.id,
      aws_api_gateway_method.user_post.id,
      aws_api_gateway_method.user_get.id,
      aws_api_gateway_method.user_delete.id,
      aws_api_gateway_integration.public_options.id,
      aws_api_gateway_integration.public_post.id,
      aws_api_gateway_integration.user_options.id,
      aws_api_gateway_integration.user_post.id,
      aws_api_gateway_integration.user_get.id,
      aws_api_gateway_integration.user_delete.id,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "api" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  deployment_id = aws_api_gateway_deployment.api.id
  stage_name    = "prod"
}

# ── Custom domain & DNS record ────────────────────────────────────────────────

resource "aws_api_gateway_domain_name" "api" {
  domain_name     = var.api_url
  certificate_arn = var.certificate_arn

  endpoint_configuration {
    types = ["EDGE"]
  }
}

resource "aws_api_gateway_base_path_mapping" "api" {
  api_id      = aws_api_gateway_rest_api.api.id
  stage_name  = aws_api_gateway_stage.api.stage_name
  domain_name = aws_api_gateway_domain_name.api.domain_name
}

resource "aws_route53_record" "api" {
  zone_id = var.zone_id
  name    = var.api_url
  type    = "A"

  alias {
    name                   = aws_api_gateway_domain_name.api.cloudfront_domain_name
    zone_id                = aws_api_gateway_domain_name.api.cloudfront_zone_id
    evaluate_target_health = false
  }
}
