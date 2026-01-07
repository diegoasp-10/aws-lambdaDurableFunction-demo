import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export interface IAMStackProps extends cdk.StackProps {
    prefix: string;
}

export class IAMStack extends cdk.Stack {
    public readonly lambdaRole;
    constructor(scope: Construct, id: string, props: IAMStackProps) {
        super(scope, id, props);

        this.lambdaRole = new iam.Role(
            this,
            `${props.prefix}-role`,
            {
                roleName: `${props.prefix}-role`,
                assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com")
            }
        );

        this.lambdaRole.attachInlinePolicy(
            new iam.Policy(this, "loggingPolicy", {
                statements: [
                    new iam.PolicyStatement({
                        effect: iam.Effect.ALLOW,
                        actions: ["logs:CreateLogGroup"],
                        resources: ["*"],
                    }),
                    new iam.PolicyStatement({
                        effect: iam.Effect.ALLOW,
                        actions: ["logs:CreateLogStream", "logs:PutLogEvents"],
                        resources: ["*"],
                    }),
                    new iam.PolicyStatement({
                        effect: iam.Effect.ALLOW,
                        actions: ["dynamodb:GetItem"],
                        resources: ["*"],
                    }),
                    new iam.PolicyStatement({
                        effect: iam.Effect.ALLOW,
                        actions: [
                            "lambda:CheckpointDurableExecution",
                            "lambda:GetDurableExecutionState",
                        ],
                        resources: ["*"],
                    }),
                ],
            })
        );
    }
}
