import * as lambda from "aws-lambda";
import {
	gateway,
	translateClient,
	exception,
	TranslationTable,
} from "/opt/nodejs/utils-lambda-layers";
import {
	ITranslateDbResult,
	ITranslateRequest,
	ITranslateResponse,
} from "@sff/shared-types";

const {
	TRANSLATION_TABLE_NAME,
	TRANSLATION_PARTITION_KEY,
	TRANSLATION_SORT_KEY,
} = process.env;

if (!TRANSLATION_TABLE_NAME) {
	throw new exception.MissingEnvVarError("TRANSLATION_TABLE_NAME");
}
if (!TRANSLATION_PARTITION_KEY) {
	throw new exception.MissingEnvVarError("TRANSLATION_PARTITION_KEY");
}
if (!TRANSLATION_SORT_KEY) {
	throw new exception.MissingEnvVarError("TRANSLATION_SORT_KEY");
}

const translateTable = new TranslationTable({
	partitionKey: TRANSLATION_PARTITION_KEY,
	tableName: TRANSLATION_TABLE_NAME,
	sortKey: TRANSLATION_SORT_KEY,
});

const getUsername = (event: lambda.APIGatewayProxyEvent) => {
	const claims = event.requestContext.authorizer?.claims;

	if (!claims) {
		throw new Error("User not authenticated");
	}

	const username = claims["cognito:username"];

	if (!username) {
		throw new Error("Username doesn't exist");
	}

	return username;
};

const parseTranslateRequest = (request: string) => {
	const body = JSON.parse(request) as ITranslateRequest;

	if (!body.sourceLang) throw new exception.MissingParameters("sourceLnang");
	if (!body.sourceText) throw new exception.MissingParameters("sourceText");
	if (!body.targetLang) throw new exception.MissingParameters("targetLang");

	return body;
};

const parseDeleteRequest = (request: string) => {
	const body = JSON.parse(request) as { requestId: string };

	if (!body.requestId) throw new exception.MissingParameters("requestId");

	return body;
};

const getCurrentTime = () => Date.now();
const formatTime = (time: number) => new Date(time).toString();

export const publicTranslate: lambda.APIGatewayProxyHandler = async function (
	event: lambda.APIGatewayProxyEvent,
	context: lambda.Context,
) {
	try {
		if (!event.body) {
			throw new exception.MissingBodyData();
		}

		const translateData = parseTranslateRequest(event.body);
		const targetText = await translateClient.translate(translateData);
		const nowEpoch = getCurrentTime();

		const response: ITranslateResponse = {
			timestamp: formatTime(nowEpoch),
			targetText,
		};

		const rtnData: ITranslateDbResult = {
			...translateData,
			...response,
			requestId: nowEpoch.toString(),
			username: "",
		};

		return gateway.createSuccessJsonResponse(JSON.stringify(rtnData));
	} catch (error: any) {
		console.log(error);
		return gateway.createErrorJsonResponse(JSON.stringify(error.toString()));
	}
};

export const userTranslate: lambda.APIGatewayProxyHandler = async function (
	event: lambda.APIGatewayProxyEvent,
	context: lambda.Context,
) {
	try {
		if (!event.body) {
			throw new exception.MissingBodyData();
		}

		const username = getUsername(event);

		const translateData = parseTranslateRequest(event.body);
		const result = await translateClient.translate(translateData);
		const nowEpoch = getCurrentTime();

		const rtnData: ITranslateResponse = {
			timestamp: formatTime(nowEpoch),
			targetText: result,
		};

		// Save data in DB
		const tableObj: ITranslateDbResult = {
			username,
			requestId: nowEpoch.toString(),
			...translateData,
			...rtnData,
		};

		translateTable.insert(tableObj);

		return gateway.createSuccessJsonResponse(JSON.stringify(tableObj));
	} catch (error: any) {
		console.log(error);
		return gateway.createErrorJsonResponse(JSON.stringify(error.toString()));
	}
};

export const getUserTranslations: lambda.APIGatewayProxyHandler =
	async function (event: lambda.APIGatewayProxyEvent, context: lambda.Context) {
		try {
			const username = getUsername(event);
			const rtnData = await translateTable.query(username);

			return gateway.createSuccessJsonResponse(JSON.stringify(rtnData));
		} catch (error: any) {
			console.log(error);

			return gateway.createErrorJsonResponse(JSON.stringify(error.toString()));
		}
	};

export const deleteTranslation: lambda.APIGatewayProxyHandler = async function (
	event: lambda.APIGatewayProxyEvent,
	context: lambda.Context,
) {
	try {
		if (!event.body) {
			throw new exception.MissingBodyData();
		}

		const body = parseDeleteRequest(event.body);

		const username = getUsername(event);

		const rtnData = await translateTable.delete({
			username,
			requestId: body.requestId,
		});
		return gateway.createSuccessJsonResponse(JSON.stringify(rtnData));
	} catch (error: any) {
		console.log(error);

		return gateway.createErrorJsonResponse(JSON.stringify(error.toString()));
	}
};
