import * as clientTranslation from "@aws-sdk/client-translate";
import * as lambda from "aws-lambda";

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

    const body = JSON.parse(event.body);
    const { sourceLanguage, targetLanguages, text } = body;

    const translateCmd = new clientTranslation.TranslateTextCommand({
      Text: text,
      SourceLanguageCode: sourceLanguage,
      TargetLanguageCode: targetLanguages,
    });

    const result = await translateClient.send(translateCmd);

    const rtnData = {
      timestamp: new Date(Date.now()).toString(),
      text: result.TranslatedText,
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
