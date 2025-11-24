import * as lambda from "aws-lambda";
import {
  gateway,
  translateClient,
  exception,
  TranslationTable,
} from "/opt/nodejs/utils-lambda-layers";
import {
  ITranslateDbObject,
  ITranslateRequest,
  ITranslateResponse,
} from "@sff/shared-types";

const { TRANSLATION_TABLE_NAME, TRANSLATION_PARTITION_KEY } = process.env;

if (!TRANSLATION_TABLE_NAME) {
  throw new exception.MissingEnvVarError("TRANSLATION_TABLE_NAME");
}
if (!TRANSLATION_PARTITION_KEY) {
  throw new exception.MissingEnvVarError("TRANSLATION_PARTITION_KEY");
}

const translateTable = new TranslationTable({
  partitionKey: TRANSLATION_PARTITION_KEY,
  tableName: TRANSLATION_TABLE_NAME,
});

export const translate: lambda.APIGatewayProxyHandler = async function (
  event: lambda.APIGatewayProxyEvent,
  context: lambda.Context
) {
  try {
    if (!event.body) {
      throw new exception.MissingBodyData();
    }

    const body = JSON.parse(event.body) as ITranslateRequest;

    if (!body.sourceLang) throw new exception.MissingParameters("sourceLnang");
    if (!body.sourceText) throw new exception.MissingParameters("sourceText");
    if (!body.targetLang) throw new exception.MissingParameters("targetLang");

    const translateData = body;
    const result = await translateClient.translate(translateData);

    if (!result.TranslatedText)
      throw new exception.MissingParameters("TranslationText");

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
    translateTable.insert(tableObj);

    return gateway.createSuccessJsonResponse(JSON.stringify(rtnData));
  } catch (error: any) {
    console.log(error);
    return gateway.createErrorJsonResponse(JSON.stringify(error.toString()));
  }
};

export const getTranslations: lambda.APIGatewayProxyHandler =
  async function () {
    try {
      const rtnData = await translateTable.getAll();
      return gateway.createSuccessJsonResponse(JSON.stringify(rtnData));
    } catch (error: any) {
      console.log(error);

      return gateway.createErrorJsonResponse(JSON.stringify(error.toString()));
    }
  };
