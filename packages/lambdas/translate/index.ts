import * as clientTranslation from "@aws-sdk/client-translate";
import * as lambda from "aws-lambda";
import { ITranslateRequest, ITranslateResponse } from "@sff/shared-types";

const translateClient = new clientTranslation.TranslateClient({
  region: "us-east-1",
});

export const index: lambda.APIGatewayProxyHandler = async function (
  event: lambda.APIGatewayProxyEvent
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

    if (!result.TranslatedText) {
      throw new Error("Translation if empty");
    }

    const rtnData: ITranslateResponse = {
      timestamp: new Date(Date.now()).toString(),
      targetText: result.TranslatedText,
    };

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
