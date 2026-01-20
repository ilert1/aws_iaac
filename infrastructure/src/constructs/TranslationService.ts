import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as path from "path";
import { RestApiService } from "./RestApiService";
import {
	createNodeJsLambda,
	lambdaLayersDirPath,
	lambdasDirPath,
} from "../helpers";

interface TranslationServiceProps extends cdk.StackProps {
	restApiService: RestApiService;
}

export class TranslationService extends Construct {
	constructor(scope: Construct, id: string, props: TranslationServiceProps) {
		super(scope, id);
		const { restApiService } = props;

		const translateLambdaPath = path.resolve(
			path.join(lambdasDirPath, "translate/index.ts"),
		);

		const utilsLayerPath = path.resolve(
			path.join(lambdaLayersDirPath, "utils-lambda-layer"),
		);

		// DynamoDb
		const table = new dynamodb.Table(this, "translations", {
			tableName: "translation",
			partitionKey: { name: "username", type: dynamodb.AttributeType.STRING },
			sortKey: { name: "requestId", type: dynamodb.AttributeType.STRING },
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			// billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
		});

		// Translate access policy
		const translateServicePolicy = new iam.PolicyStatement({
			actions: ["translate:TranslateText"],
			resources: ["*"],
		});

		// DynamoDb table access policy
		const translateTablePolicy = new iam.PolicyStatement({
			actions: [
				"dynamodb:PutItem",
				"dynamodb:Scan",
				"dynamodb:GetItem",
				"dynamodb:DeleteItem",
				"dynamodb:Query",
			],
			resources: ["*"],
		});

		const utilsLambdaLayer = new lambda.LayerVersion(this, "utilsLambdaLayer", {
			code: lambda.Code.fromAsset(utilsLayerPath),
			compatibleRuntimes: [lambda.Runtime.NODEJS_22_X],
			removalPolicy: cdk.RemovalPolicy.DESTROY,
		});

		const environment = {
			TRANSLATION_TABLE_NAME: table.tableName,
			TRANSLATION_PARTITION_KEY: "username",
			TRANSLATION_SORT_KEY: "requestId",
		};

		// The translation lambda
		const translateLambda = createNodeJsLambda(this, "translateLambda", {
			lambdaRelPath: "translate/index.ts",
			handler: "userTranslate",
			initialPolicy: [translateServicePolicy, translateTablePolicy],
			lambdaLayers: [utilsLambdaLayer],
			environment,
		});

		restApiService.addMethod(
			restApiService.userResource,
			"POST",
			translateLambda,
			true,
		);

		// Get translations lambda
		const getTranslationsLambda = createNodeJsLambda(
			this,
			"getTranslationsLambda",
			{
				lambdaRelPath: "translate/index.ts",
				handler: "getUserTranslations",
				initialPolicy: [translateTablePolicy],
				lambdaLayers: [utilsLambdaLayer],
				environment,
			},
		);

		restApiService.addMethod(
			restApiService.userResource,
			"GET",
			getTranslationsLambda,
			true,
		);

		// Delete translation lambda
		const deleteTranslationLambda = createNodeJsLambda(
			this,
			"deleteTranslationLambda",
			{
				lambdaRelPath: "translate/index.ts",
				handler: "deleteTranslation",
				initialPolicy: [translateTablePolicy],
				lambdaLayers: [utilsLambdaLayer],
				environment,
			},
		);

		restApiService.addMethod(
			restApiService.userResource,
			"DELETE",
			deleteTranslationLambda,
			true,
		);

		// Get public translations lambda
		const publicTranslateLambda = createNodeJsLambda(
			this,
			"publicTranslateLambda",
			{
				lambdaRelPath: "translate/index.ts",
				handler: "publicTranslate",
				initialPolicy: [translateServicePolicy],
				lambdaLayers: [utilsLambdaLayer],
				environment,
			},
		);

		restApiService.addMethod(
			restApiService.publicResource,
			"POST",
			publicTranslateLambda,
			false,
		);
	}
}
