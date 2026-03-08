locals {
  lambdas_dir = "${path.root}/../packages/lambdas"
  layers_dir  = "${path.root}/../packages/lambda-layers"
  build_dir   = "${path.root}/.build"
}

# ── DynamoDB ──────────────────────────────────────────────────────────────────

resource "aws_dynamodb_table" "translations" {
  name         = "translation"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "username"
  range_key    = "requestId"

  attribute {
    name = "username"
    type = "S"
  }

  attribute {
    name = "requestId"
    type = "S"
  }
}

# ── Shared IAM policies ───────────────────────────────────────────────────────

resource "aws_iam_policy" "translate_service" {
  name = "translator-translate-service-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["translate:TranslateText"]
      Resource = "*"
    }]
  })
}

resource "aws_iam_policy" "dynamodb_access" {
  name = "translator-dynamodb-access-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "dynamodb:PutItem",
        "dynamodb:Scan",
        "dynamodb:GetItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
      ]
      Resource = "*"
    }]
  })
}

data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

# ── Per-Lambda execution roles ────────────────────────────────────────────────

resource "aws_iam_role" "lambda_translate" {
  name               = "translator-lambda-translate-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

resource "aws_iam_role_policy_attachment" "lambda_translate_basic" {
  role       = aws_iam_role.lambda_translate.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_translate_svc" {
  role       = aws_iam_role.lambda_translate.name
  policy_arn = aws_iam_policy.translate_service.arn
}

resource "aws_iam_role_policy_attachment" "lambda_translate_ddb" {
  role       = aws_iam_role.lambda_translate.name
  policy_arn = aws_iam_policy.dynamodb_access.arn
}

resource "aws_iam_role" "lambda_get_translations" {
  name               = "translator-lambda-get-translations-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

resource "aws_iam_role_policy_attachment" "lambda_get_translations_basic" {
  role       = aws_iam_role.lambda_get_translations.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_get_translations_ddb" {
  role       = aws_iam_role.lambda_get_translations.name
  policy_arn = aws_iam_policy.dynamodb_access.arn
}

resource "aws_iam_role" "lambda_delete_translation" {
  name               = "translator-lambda-delete-translation-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

resource "aws_iam_role_policy_attachment" "lambda_delete_translation_basic" {
  role       = aws_iam_role.lambda_delete_translation.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_delete_translation_ddb" {
  role       = aws_iam_role.lambda_delete_translation.name
  policy_arn = aws_iam_policy.dynamodb_access.arn
}

resource "aws_iam_role" "lambda_public_translate" {
  name               = "translator-lambda-public-translate-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

resource "aws_iam_role_policy_attachment" "lambda_public_translate_basic" {
  role       = aws_iam_role.lambda_public_translate.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_public_translate_svc" {
  role       = aws_iam_role.lambda_public_translate.name
  policy_arn = aws_iam_policy.translate_service.arn
}

# ── Lambda build ──────────────────────────────────────────────────────────────

resource "null_resource" "build_lambdas" {
  triggers = {
    source_hash = fileexists("${local.lambdas_dir}/translate/index.ts") ? filemd5("${local.lambdas_dir}/translate/index.ts") : "missing"
  }

  provisioner "local-exec" {
    command = <<-EOT
      mkdir -p "${local.build_dir}/lambda"
      npx esbuild "${local.lambdas_dir}/translate/index.ts" \
        --bundle \
        --minify \
        --platform=node \
        --target=node22 \
        "--external:/opt/nodejs/utils-lambda-layer" \
        "--outfile=${local.build_dir}/lambda/index.js"
    EOT
    interpreter = ["bash", "-c"]
  }
}

data "archive_file" "lambda_zip" {
  depends_on  = [null_resource.build_lambdas]
  type        = "zip"
  source_file = "${local.build_dir}/lambda/index.js"
  output_path = "${local.build_dir}/lambda.zip"
}

# ── Lambda Layer build ────────────────────────────────────────────────────────

resource "null_resource" "build_lambda_layer" {
  triggers = {
    layer_hash = sha1(join("", [
      for f in sort(fileset("${local.layers_dir}/utils-lambda-layer", "**/*")) :
      filemd5("${local.layers_dir}/utils-lambda-layer/${f}")
      if !can(regex("node_modules", f))
    ]))
  }

  provisioner "local-exec" {
    command = <<-EOT
      LAYER_SRC="${local.layers_dir}/utils-lambda-layer"
      LAYER_OUT="${local.build_dir}/layer/nodejs/utils-lambda-layer"
      mkdir -p "$LAYER_OUT"
      cp -r "$LAYER_SRC/." "$LAYER_OUT/"
      if [ -f "$LAYER_OUT/package.json" ]; then
        cd "$LAYER_OUT" && npm install --omit=dev
      fi
    EOT
    interpreter = ["bash", "-c"]
  }
}

data "archive_file" "lambda_layer_zip" {
  depends_on  = [null_resource.build_lambda_layer]
  type        = "zip"
  source_dir  = "${local.build_dir}/layer"
  output_path = "${local.build_dir}/layer.zip"
}

resource "aws_lambda_layer_version" "utils" {
  layer_name          = "utils-lambda-layer"
  filename            = data.archive_file.lambda_layer_zip.output_path
  source_code_hash    = data.archive_file.lambda_layer_zip.output_base64sha256
  compatible_runtimes = ["nodejs22.x"]
}

# ── Lambda functions ──────────────────────────────────────────────────────────

locals {
  lambda_env = {
    TRANSLATION_TABLE_NAME    = aws_dynamodb_table.translations.name
    TRANSLATION_PARTITION_KEY = "username"
    TRANSLATION_SORT_KEY      = "requestId"
  }
}

resource "aws_lambda_function" "translate" {
  function_name    = "translator-userTranslate"
  role             = aws_iam_role.lambda_translate.arn
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  handler          = "index.userTranslate"
  runtime          = "nodejs22.x"
  layers           = [aws_lambda_layer_version.utils.arn]
  environment {
    variables = local.lambda_env
  }
}

resource "aws_lambda_function" "get_translations" {
  function_name    = "translator-getUserTranslations"
  role             = aws_iam_role.lambda_get_translations.arn
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  handler          = "index.getUserTranslations"
  runtime          = "nodejs22.x"
  layers           = [aws_lambda_layer_version.utils.arn]
  environment {
    variables = local.lambda_env
  }
}

resource "aws_lambda_function" "delete_translation" {
  function_name    = "translator-deleteTranslation"
  role             = aws_iam_role.lambda_delete_translation.arn
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  handler          = "index.deleteTranslation"
  runtime          = "nodejs22.x"
  layers           = [aws_lambda_layer_version.utils.arn]
  environment {
    variables = local.lambda_env
  }
}

resource "aws_lambda_function" "public_translate" {
  function_name    = "translator-publicTranslate"
  role             = aws_iam_role.lambda_public_translate.arn
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  handler          = "index.publicTranslate"
  runtime          = "nodejs22.x"
  layers           = [aws_lambda_layer_version.utils.arn]
  environment {
    variables = local.lambda_env
  }
}
