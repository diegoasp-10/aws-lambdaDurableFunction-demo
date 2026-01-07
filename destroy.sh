#!/bin/bash

set -e

# Parse AWS profile parameter
PROFILE=""
PROFILE_FLAG=""

if [ -n "$1" ]; then
    PROFILE="$1"
    PROFILE_FLAG="--profile $PROFILE"
    echo "Using AWS Profile: $PROFILE"
else
    echo "No AWS profile specified. Using default profile."
fi

echo "=========================================="
echo "AWS Lambda Durable Function Demo"
echo "Cleanup Script"
echo "=========================================="
echo ""
echo "WARNING: This will delete all deployed resources:"
echo "  - Lambda function and CloudWatch logs"
echo "  - DynamoDB table and all data"
echo "  - IAM roles and policies"
echo "  - All CloudFormation stacks"
echo ""
read -p "Are you sure you want to continue? (yes/no): " -r
echo ""

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]
then
    echo "Cleanup cancelled."
    exit 0
fi

echo "Destroying all CDK stacks..."
npx cdk destroy --all --force $PROFILE_FLAG

echo ""
echo "=========================================="
echo "Cleanup Complete!"
echo "=========================================="
echo ""
echo "All resources have been removed from your AWS account."
echo ""
