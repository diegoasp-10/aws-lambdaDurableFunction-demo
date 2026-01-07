"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.config = void 0;
const durable_execution_sdk_js_1 = require("@aws/durable-execution-sdk-js");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
exports.config = {
    name: "Named Wait",
    description: "Using context.wait() with a custom name",
};
const dynamoClient = new client_dynamodb_1.DynamoDBClient({
    region: process.env.REGION || "us-east-1",
});
const client = lib_dynamodb_1.DynamoDBDocumentClient.from(dynamoClient);
const params = {
    TableName: process.env.TABLE_NAME,
    Key: {
        pk: "test-item",
    },
};
const command = new lib_dynamodb_1.GetCommand(params);
exports.handler = (0, durable_execution_sdk_js_1.withDurableExecution)((event, context) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield context.waitForCondition((state) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log("getting data");
            console.log(`${JSON.stringify(command)}`);
            const data = yield client.send(command);
            console.log(`${JSON.stringify(data)}`);
            if (data.Item && data.Item.value === "completed") {
                console.log("value is correct, we are complete");
                return (state = "completed");
            }
        }
        catch (error) {
            console.log(`${JSON.stringify(error)}`);
            console.log("there is an error, we are incomplete");
            return (state = "incomplete");
        }
        console.log("fall back to incomplete");
        return (state = "incomplete");
    }), {
        waitStrategy: (state) => {
            if (state === "completed") {
                console.log("we are done, we have the right value in our business logic");
                return { shouldContinue: false };
            }
            console.log("we are not done, wait five mins and try again");
            return { shouldContinue: true, delay: { minutes: 1 } };
        },
        initialState: "incomplete",
    });
    return result;
}));
