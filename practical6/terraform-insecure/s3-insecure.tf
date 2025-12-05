# INTENTIONALLY INSECURE TERRAFORM CONFIGURATION
# This file demonstrates common security misconfigurations
# DO NOT use this in production!

# KMS key for bucket encryption
resource "aws_kms_key" "bucket_key" {
  description             = "KMS key for S3 bucket encryption"
  deletion_window_in_days = 10
  enable_key_rotation     = true

  tags = {
    Name        = "S3 Bucket Encryption Key"
    Environment = "dev"
  }
}

resource "aws_kms_alias" "bucket_key_alias" {
  name          = "alias/s3-bucket-key"
  target_key_id = aws_kms_key.bucket_key.key_id
}

resource "aws_s3_bucket" "insecure_example" {
  bucket = "insecure-example-bucket"

  tags = {
    Name        = "Insecure Example"
    Environment = "dev"
  }
}

# FIX 1: Added encryption with customer-managed KMS key
resource "aws_s3_bucket_server_side_encryption_configuration" "insecure_example" {
  bucket = aws_s3_bucket.insecure_example.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.bucket_key.arn
    }
    bucket_key_enabled = true
  }
}

# FIX 2: Added versioning
resource "aws_s3_bucket_versioning" "insecure_example" {
  bucket = aws_s3_bucket.insecure_example.id

  versioning_configuration {
    status = "Enabled"
  }
}

# FIX 3: Added access logging
resource "aws_s3_bucket_logging" "insecure_example" {
  bucket = aws_s3_bucket.insecure_example.id

  target_bucket = aws_s3_bucket.backup_insecure.id
  target_prefix = "log/"
}
resource "aws_s3_bucket_public_access_block" "insecure_example" {
  bucket = aws_s3_bucket.insecure_example.id

  # FIX 4: Block all public access
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# FIX 5: Removed overly permissive public bucket policy
# Bucket policy removed to prevent public delete access

# Another bucket - now secured
resource "aws_s3_bucket" "backup_insecure" {
  bucket = "backup-insecure-bucket"

  # FIX 6: Added tags for governance
  tags = {
    Name        = "Backup Bucket"
    Environment = "dev"
    Purpose     = "Logging and Backup"
  }
}

# FIX: Added encryption for backup bucket with customer-managed KMS key
resource "aws_s3_bucket_server_side_encryption_configuration" "backup_insecure" {
  bucket = aws_s3_bucket.backup_insecure.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.bucket_key.arn
    }
    bucket_key_enabled = true
  }
}

# FIX: Added versioning for backup bucket
resource "aws_s3_bucket_versioning" "backup_insecure" {
  bucket = aws_s3_bucket.backup_insecure.id

  versioning_configuration {
    status = "Enabled"
  }
}

# FIX: Added public access block for backup bucket
resource "aws_s3_bucket_public_access_block" "backup_insecure" {
  bucket = aws_s3_bucket.backup_insecure.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# FIX 7: Added lifecycle policy to manage costs
resource "aws_s3_bucket_lifecycle_configuration" "backup_insecure" {
  bucket = aws_s3_bucket.backup_insecure.id

  rule {
    id     = "delete-old-logs"
    status = "Enabled"

    expiration {
      days = 90
    }

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}
