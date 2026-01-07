import {
  DurableContext,
  withDurableExecution,
} from "@aws/durable-execution-sdk-js";
import { DurableConfig } from "@aws-sdk/client-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

interface ExampleConfig {
  name: string;
  description?: string;
  durableConfig?: DurableConfig | null;
}

export const config: ExampleConfig = {
  name: "Named Wait",
  description: "Using context.wait() with a custom name",
};

const dynamoClient = new DynamoDBClient({
  region: process.env.REGION || "us-east-1",
});
const client = DynamoDBDocumentClient.from(dynamoClient);
const params = {
  TableName: process.env.TABLE_NAME,
  Key: {
    pk: "test-item",
  },
};
const command = new GetCommand(params);

export const handler = withDurableExecution(
  async (event: any, context: DurableContext) => {
    const result = await context.waitForCondition(
      async (state: string) => {
        try {

          console.log("getting data");
          console.log(`${JSON.stringify(command)}`);
          const data = await client.send(command);
          console.log(`${JSON.stringify(data)}`);

          if (data.Item && data.Item.value === "completed") {

            console.log("value is correct, we are complete");
            return (state = "completed");

          }
        } catch (error) {

          console.log(`${JSON.stringify(error)}`);
          console.log("there is an error, we are incomplete");
          return (state = "incomplete");

        }

        console.log("fall back to incomplete");
        return (state = "incomplete");

      },
      {
        waitStrategy: (state: string) => {
          if (state === "completed") {
            console.log(
              "we are done, we have the right value in our business logic"
            );
            return { shouldContinue: false };
          }
          console.log("we are not done, wait five mins and try again");
          return { shouldContinue: true, delay: { minutes: 1 } };
        },
        initialState: "incomplete",
      }
    );
    return result;
  }
);