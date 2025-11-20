import * as clientTranslation from "@aws-sdk/client-translate";
import * as dynamoDb from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import * as lambda from "aws-lambda";
import {
  ITranslateDbObject,
  ITranslateRequest,
  ITranslateResponse,
} from "@sff/shared-types";

const { TRANSLATION_TABLE_NAME, TRANSLATION_PARTITION_KEY } = process.env;
console.log(
  "TRANSLATION_TABLE_NAME & TRANSLATION_PARTITION_KEY",
  TRANSLATION_TABLE_NAME,
  TRANSLATION_PARTITION_KEY
);

if (!TRANSLATION_TABLE_NAME) {
  throw new Error("TRANSLATION_TABLE_NAME is not set");
}
if (!TRANSLATION_PARTITION_KEY) {
  throw new Error("TRANSLATION_PARTITION_KEY is not set");
}

const translateClient = new clientTranslation.TranslateClient({
  region: "us-east-1",
});
const dynamoDbClient = new dynamoDb.DynamoDBClient({});

export const translate: lambda.APIGatewayProxyHandler = async function (
  event: lambda.APIGatewayProxyEvent,
  context: lambda.Context
) {
  try {
    if (!event.body) {
      throw new Error("No body provided");
    }

    const body = JSON.parse(event.body) as ITranslateRequest;
    const { sourceLang, sourceText, targetLang } = body;

    const translateCmd = new clientTranslation.TranslateTextCommand({
      Text: sourceText,
      SourceLanguageCode: sourceLang,
      TargetLanguageCode: targetLang,
    });

    const result = await translateClient.send(translateCmd);
    console.log(result);

    if (!result.TranslatedText) {
      throw new Error("Translation if empty");
    }

    const rtnData: ITranslateResponse = {
      timestamp: new Date(Date.now()).toString(),
      targetText: result.TranslatedText,
    };

    // Save data in DB
    const tableObj: ITranslateDbObject = {
      requestId: context.awsRequestId,
      ...body,
      ...rtnData,
    };

    const tableInsertCmd: dynamoDb.PutItemCommandInput = {
      TableName: TRANSLATION_TABLE_NAME,
      Item: marshall(tableObj),
    };

    await dynamoDbClient.send(new dynamoDb.PutItemCommand(tableInsertCmd));

    console.log(rtnData);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
      },

      body: JSON.stringify(rtnData),
    };
  } catch (error: any) {
    console.log(error);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
      },
      body: JSON.stringify(error.toString()),
    };
  }
};

export const getTranslations: lambda.APIGatewayProxyHandler = async function (
  event: lambda.APIGatewayProxyEvent,
  context: lambda.Context
) {
  try {
    const tableScanCmd: dynamoDb.ScanCommandInput = {
      TableName: TRANSLATION_TABLE_NAME,
    };

    console.log("Scan:cmd : ", tableScanCmd);

    const tableScanCmdOutput = await dynamoDbClient.send(
      new dynamoDb.ScanCommand(tableScanCmd)
    );

    if (!tableScanCmdOutput.Items) {
      throw new Error("No items found");
    }

    const rtnData = tableScanCmdOutput.Items.map(
      (item) => unmarshall(item) as ITranslateDbObject
    );

    console.log("Scan:output : ", rtnData);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
      },

      body: JSON.stringify(rtnData),
    };
  } catch (error: any) {
    console.log(error);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
      },
      body: JSON.stringify(error.toString()),
    };
  }
};
