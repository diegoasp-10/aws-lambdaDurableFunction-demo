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
echo "Deployment Script"
echo "=========================================="
echo ""

echo "Step 1: Installing CDK dependencies..."
npm install

echo ""
echo "Step 2: Preparing Lambda function..."
cd scripts/lambda_function

echo "  - Initializing package.json..."
npm init -y

echo "  - Installing Lambda dependencies..."
npm install @aws/durable-execution-sdk-js @aws-sdk/client-lambda @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb

echo "  - Installing TypeScript..."
npm install -D typescript @types/node

echo "  - Initializing TypeScript configuration..."
npx tsc --init

echo "  - Compiling TypeScript to JavaScript..."
npx tsc

cd ../..

echo ""
echo "Step 3: Deploying all CDK stacks..."
npx cdk deploy --all --require-approval never $PROFILE_FLAG

echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "Lambda Function: demo-lambda-durable-function"
echo "DynamoDB Table: demo-lambda-durable-table"
echo ""
if [ -n "$PROFILE" ]; then
    echo "To test the durable function, run:"
    echo "  aws lambda invoke --function-name demo-lambda-durable-function --payload '{}' response.json --profile $PROFILE"
    echo ""
    echo "To complete the workflow, insert the completion item:"
    echo "  aws dynamodb put-item --table-name demo-lambda-durable-table --item '{\"pk\": {\"S\": \"test-item\"}, \"value\": {\"S\": \"completed\"}}' --profile $PROFILE"
    echo ""
    echo "To view logs:"
    echo "  aws logs tail /aws/lambda/demo-lambda-durable-function-logs --follow --profile $PROFILE"
else
    echo "To test the durable function, run:"
    echo "  aws lambda invoke --function-name demo-lambda-durable-function --payload '{}' response.json"
    echo ""
    echo "To complete the workflow, insert the completion item:"
    echo "  aws dynamodb put-item --table-name demo-lambda-durable-table --item '{\"pk\": {\"S\": \"test-item\"}, \"value\": {\"S\": \"completed\"}}'"
    echo ""
    echo "To view logs:"
    echo "  aws logs tail /aws/lambda/demo-lambda-durable-function-logs --follow"
fi
echo ""
