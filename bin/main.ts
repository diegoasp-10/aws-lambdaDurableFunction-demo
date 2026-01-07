#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import * as fs from "fs";
import * as path from "path";
import { IAMStack } from '../lib/iam-stack';
import { DynamodbStack } from '../lib/dynamodb-stack';
import { LambdaStack } from '../lib/lambda-stack';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT || app.node.tryGetContext("account"),
  region: process.env.CDK_DEFAULT_REGION || app.node.tryGetContext("region"),
};

const configPath = path.join(
 __dirname,
 "..",
 "config",
 "config.json"
);
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

const tagsPath = path.join(
  __dirname,
  "..",
  "config",
  "tags.json"
);
const tags = JSON.parse(fs.readFileSync(tagsPath, "utf8"));

const iamStack = new IAMStack(app, `${config.prefix}-iam-stack`, {
  stackName: `${config.prefix}-iam-stack`,
  prefix: config.prefix,
  tags: tags,
  env: {
    account: env.account,
    region: env.region
  },
  description: "AWS Lambda Durable Function Demo IAM Stack"
})

const dynamodbStack = new DynamodbStack(app, `${config.prefix}-dynamodb-stack`, {
  stackName: `${config.prefix}-dynamodb-stack`,
  prefix: config.prefix,
  tags: tags,
  env: {
    account: env.account,
    region: env.region
  },
  description: "AWS Lambda Durable Function Demo DynamoDB Stack"
})

const lambdaStack = new LambdaStack(app, `${config.prefix}-lambda-stack`, {
  stackName: `${config.prefix}-lambda-stack`,
  prefix: config.prefix,
  tags: tags,
  env: {
    account: env.account,
    region: env.region
  },
  description: "AWS Lambda Durable Function Demo Lambda Stack",
  lambdaRole: iamStack.lambdaRole,
  dynamodbTable: dynamodbStack.dynamodbTable
})
