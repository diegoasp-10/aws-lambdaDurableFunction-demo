import * as cdk from "aws-cdk-lib";
import * as path from 'path';
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export interface LambdaStackProps extends cdk.StackProps {
    prefix: string;
    lambdaRole: cdk.aws_iam.Role;
    dynamodbTable: cdk.aws_dynamodb.Table;
}

export class LambdaStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: LambdaStackProps) {
        super(scope, id, props);

        const durableFunction = new lambda.Function(this, `${props.prefix}-function`, {
            runtime: lambda.Runtime.NODEJS_22_X,
            handler: "index.handler",
            code: lambda.Code.fromAsset(
                path.join(__dirname, '../scripts/lambda_function')
            ),
            functionName: `${props.prefix}-function`,
            environment: {
                TABLE_NAME: props.dynamodbTable.tableName,
            },
            durableConfig: {
                executionTimeout: cdk.Duration.hours(1),
                retentionPeriod: cdk.Duration.days(30),
            },
            role: props.lambdaRole,
            logGroup: new cdk.aws_logs.LogGroup(this, `${props.prefix}-function-logs`, {
                logGroupName: `/aws/lambda/${props.prefix}-function-logs`,
                retention: cdk.aws_logs.RetentionDays.ONE_WEEK,
                removalPolicy: cdk.RemovalPolicy.DESTROY
            }),
        });
    }
}
