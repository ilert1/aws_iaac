resource "aws_cognito_user_pool" "main" {
  name = "translatorUserPool"

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length    = 8
    require_uppercase = true
    require_lowercase = true
    require_numbers   = true
    require_symbols   = false
  }

  deletion_protection = "INACTIVE"
}

resource "aws_cognito_user_pool_client" "web" {
  name         = "translator-web-client"
  user_pool_id = aws_cognito_user_pool.main.id

  generate_secret              = false
  supported_identity_providers = ["COGNITO"]

  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_PASSWORD_AUTH",
  ]
}
