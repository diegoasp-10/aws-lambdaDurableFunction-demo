import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

export interface DynamodbStackProps extends cdk.StackProps {
    prefix: string;
}

export class DynamodbStack extends cdk.Stack {
    public readonly dynamodbTable;
    constructor(scope: Construct, id: string, props: DynamodbStackProps) {
        super(scope, id, props);

        this.dynamodbTable = new dynamodb.Table(this, `${props.prefix}-table`, {
            tableName: `${props.prefix}-table`,
            partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
            tableClass: dynamodb.TableClass.STANDARD,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });
    }
}
