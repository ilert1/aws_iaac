output "translate_invoke_arn" {
  value = aws_lambda_function.translate.invoke_arn
}

output "translate_function_name" {
  value = aws_lambda_function.translate.function_name
}

output "get_translations_invoke_arn" {
  value = aws_lambda_function.get_translations.invoke_arn
}

output "get_translations_function_name" {
  value = aws_lambda_function.get_translations.function_name
}

output "delete_translation_invoke_arn" {
  value = aws_lambda_function.delete_translation.invoke_arn
}

output "delete_translation_function_name" {
  value = aws_lambda_function.delete_translation.function_name
}

output "public_translate_invoke_arn" {
  value = aws_lambda_function.public_translate.invoke_arn
}

output "public_translate_function_name" {
  value = aws_lambda_function.public_translate.function_name
}
