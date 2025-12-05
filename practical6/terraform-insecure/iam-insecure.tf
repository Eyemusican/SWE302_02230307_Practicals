# INTENTIONALLY INSECURE IAM CONFIGURATION
# This file demonstrates common IAM security misconfigurations
# DO NOT use this in production!

# ISSUE 1: Overly permissive IAM policy with wildcard actions
resource "aws_iam_role" "insecure_role" {
  name = "insecure-app-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}

# FIX 2 & 3: Least privilege IAM policy with specific actions and resources
resource "aws_iam_role_policy" "insecure_policy" {
  name = "insecure-policy"
  role = aws_iam_role.insecure_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:ListBucket"
        ]
        Resource = [
          "arn:aws:s3:::insecure-example-bucket",
          "arn:aws:s3:::insecure-example-bucket/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:Query"
        ]
        Resource = "arn:aws:dynamodb:*:*:table/example-table"
      },
      {
        Effect = "Allow"
        Action = [
          "ec2:DescribeInstances",
          "ec2:DescribeImages"
        ]
        Resource = "*"
      }
    ]
  })
}

# FIX 4-7: Removed hardcoded credentials and admin access
# Use IAM roles and temporary credentials instead
# Access keys should be managed through AWS Secrets Manager or SSM Parameter Store

resource "aws_iam_user" "insecure_user" {
  name = "service-account"
  path = "/"

  tags = {
    Purpose = "Service Account"
  }
}

# FIX 5: Added account password policy
resource "aws_iam_account_password_policy" "strict" {
  minimum_password_length        = 14
  require_lowercase_characters   = true
  require_uppercase_characters   = true
  require_numbers                = true
  require_symbols                = true
  allow_users_to_change_password = true
  max_password_age               = 90
  password_reuse_prevention      = 24
}

# FIX 7: Removed admin policy attachment
# Users should have minimal required permissions only

# Note: MFA enforcement, key rotation, and CloudTrail logging
# should be configured at the AWS account level
