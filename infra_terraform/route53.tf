# Look up the pre-existing hosted zone for the domain.
# The zone must already exist in Route53 before running Terraform.
data "aws_route53_zone" "zone" {
  name         = var.domain
  private_zone = false
}
