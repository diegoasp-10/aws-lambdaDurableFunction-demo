# AWS Lambda Durable Function Demo

## Description

This project demonstrates AWS Lambda Durable Functions using the AWS Durable Execution SDK. The demo implements a long-running Lambda function that periodically checks a DynamoDB table for a specific condition, showcasing how durable functions can maintain state across multiple executions without running continuously.

The Lambda function uses `waitForCondition` to poll a DynamoDB table every 5 minutes, checking if a specific item has a value of "completed". This pattern is useful for workflows that need to wait for external state changes, such as:
- Waiting for manual approvals
- Polling for job completion
- Monitoring external system states
- Implementing retry logic with delays

**Architecture:**
- **DynamoDB Table**: Stores application state (partition key: `pk`)
- **Lambda Function**: Durable function with Node.js 22.x runtime
- **IAM Role**: Provides Lambda permissions to access DynamoDB
- **CloudWatch Logs**: Stores function execution logs (1 week retention)

The infrastructure is deployed using AWS CDK with TypeScript.

**Reference**: This demo is based on the concepts from [My First Durable Lambda Function](https://medium.com/@smorland/my-first-durable-lambda-function-9b923ec3a09f)

## Prerequisites

- Node.js 22.x or later
- AWS CLI configured with appropriate credentials
- AWS CDK CLI installed (`npm install -g aws-cdk`)
- An AWS account with permissions to create Lambda, DynamoDB, IAM, and CloudWatch resources

## Deploy Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Your Deployment

Edit `config/config.json` to customize the resource prefix (default: `demo-lambda-durable`)

Optionally, edit `config/tags.json` to add custom AWS tags to your resources.

### 3. Bootstrap CDK (First Time Only)

If you haven't used CDK in your AWS account/region before:

```bash
npx cdk bootstrap
```

### 4. Deploy the Infrastructure

You can deploy using the provided script or manually:

**Option A: Using the deploy script**
```bash
chmod +x deploy.sh
./deploy.sh [profile-name]
```

If you use AWS profiles, pass your profile name as a parameter:
```bash
./deploy.sh my-aws-profile
```

Without a profile parameter, it uses the default AWS profile.

**Option B: Manual deployment**
```bash
npm run build
npx cdk deploy --all --profile your-profile-name
```

The deployment will create three stacks:
- `demo-lambda-durable-iam-stack`: IAM roles and permissions
- `demo-lambda-durable-dynamodb-stack`: DynamoDB table
- `demo-lambda-durable-lambda-stack`: Lambda function with durable execution

## Demo Instructions

This demo showcases how AWS Lambda Durable Functions can wait for external state changes. The Lambda function will continuously poll a DynamoDB item until its status changes from "incomplete" to "completed".

### 1. Create the Initial DynamoDB Item

First, create an item in DynamoDB with an "incomplete" status. The durable function will monitor this item:

```bash
aws dynamodb put-item \
  --table-name demo-lambda-durable-table \
  --item '{"pk": {"S": "test-item"}, "value": {"S": "incomplete"}}'
```

**Note**: The partition key must be `test-item` and the initial value must be `incomplete`.

### 2. Invoke the Lambda Function

Start the durable function execution:

```bash
aws lambda invoke \
  --function-name demo-lambda-durable-function \
  --payload '{}' \
  response.json
```

The function will begin polling the DynamoDB table every 5 minutes, checking if the item's value has changed to "completed".

### 3. Monitor the Execution

View the CloudWatch logs to see the function checking the table:

```bash
aws logs tail /aws/lambda/demo-lambda-durable-function-logs --follow
```

You should see log messages indicating:
- "getting data" - The function is querying DynamoDB
- "we are not done, wait five mins and try again" - The value is still "incomplete"

### 4. Change the Item Status (After ~5 Minutes)

Wait approximately 5 minutes to observe the polling behavior, then update the DynamoDB item to mark it as completed:

```bash
aws dynamodb put-item \
  --table-name demo-lambda-durable-table \
  --item '{"pk": {"S": "test-item"}, "value": {"S": "completed"}}'
```

**Important**: This simulates a manual approval or an external process completing. In a real-world scenario, this could be:
- A human approval in a workflow
- An external API callback
- A batch job completion
- Any manual intervention required in your business process

### 5. Verify Completion

The next time the durable function polls (within 5 minutes), it will detect the "completed" value and finish execution. Check the logs to confirm:

```bash
aws logs tail /aws/lambda/demo-lambda-durable-function-logs --follow
```

You should see the message: **"we are done, we have the right value in our business logic"**

This confirms the durable function successfully detected the state change and completed its workflow.

### 6. Reset for Another Test

To run the demo again, delete the item from DynamoDB:

```bash
aws dynamodb delete-item \
  --table-name demo-lambda-durable-table \
  --key '{"pk": {"S": "test-item"}}'
```

Then restart from step 1.

## Cleanup Instructions

To avoid incurring ongoing AWS charges, destroy all deployed resources:

**Option A: Using the cleanup script**
```bash
chmod +x destroy.sh
./destroy.sh [profile-name]
```

If you use AWS profiles, pass your profile name as a parameter:
```bash
./destroy.sh my-aws-profile
```

Without a profile parameter, it uses the default AWS profile.

**Option B: Manual cleanup**
```bash
npx cdk destroy --all --profile your-profile-name
```

Confirm the deletion when prompted. This will remove:
- Lambda function and its log group
- DynamoDB table and all stored data
- IAM roles and policies
- All related CloudFormation stacks

## Project Structure

```
.
├── bin/
│   └── main.ts                 # CDK app entry point
├── lib/
│   ├── iam-stack.ts           # IAM roles and policies
│   ├── dynamodb-stack.ts      # DynamoDB table definition
│   └── lambda-stack.ts        # Lambda function with durable config
├── scripts/
│   └── lambda_function/
│       └── index.ts           # Durable Lambda function code
├── config/
│   ├── config.json           # Deployment configuration
│   └── tags.json             # AWS resource tags
├── deploy.sh                  # Deployment script
├── destroy.sh                 # Cleanup script
└── README.md
```

## Key Concepts

**Durable Execution**: The Lambda function can pause and resume execution over extended periods without consuming resources while waiting. State is automatically persisted between executions.

**Wait Strategy**: The function uses `waitForCondition` with a custom wait strategy that checks every 5 minutes, demonstrating how to implement polling logic efficiently.

**Execution Timeout**: Set to 1 hour in the durable configuration, allowing the function to run for extended periods.

**Retention Period**: Set to 30 days, determining how long execution state is maintained.
