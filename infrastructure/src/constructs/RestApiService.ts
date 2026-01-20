import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53Targets from "aws-cdk-lib/aws-route53-targets";
import * as cognito from "aws-cdk-lib/aws-cognito";

interface RestApiServiceProps extends cdk.StackProps {
	apiUrl: string;
	certificate: acm.Certificate;
	zone: route53.IHostedZone;
	userPool?: cognito.UserPool;
}

export class RestApiService extends Construct {
	public restApi: apigw.RestApi;
	public authorizer?: apigw.CognitoUserPoolsAuthorizer;
	public publicResource: apigw.Resource;
	public userResource: apigw.Resource;

	constructor(scope: Construct, id: string, props: RestApiServiceProps) {
		super(scope, id);
		const { apiUrl, certificate, zone, userPool } = props;

		// The API Gateway
		this.restApi = new apigw.RestApi(this, "translateRestApi", {
			domainName: {
				domainName: apiUrl,
				certificate,
			},
			defaultCorsPreflightOptions: {
				allowOrigins: apigw.Cors.ALL_ORIGINS,
				allowMethods: apigw.Cors.ALL_METHODS,
				allowCredentials: true,
				allowHeaders: apigw.Cors.DEFAULT_HEADERS,
			},
		});

		this.publicResource = this.restApi.root.addResource("public");
		this.userResource = this.restApi.root.addResource("user");

		// Create authorizer if userPool is provided
		if (userPool) {
			this.authorizer = new apigw.CognitoUserPoolsAuthorizer(
				this.restApi,
				"authorizer",
				{
					cognitoUserPools: [userPool],
					authorizerName: "userPoolAuthorizer",
				},
			);
		}

		new route53.ARecord(this, "apiDns", {
			zone,
			recordName: "api",
			target: route53.RecordTarget.fromAlias(
				new route53Targets.ApiGateway(this.restApi),
			),
		});
	}

	addMethod(
		resource: apigw.Resource,
		httpMethod: "POST" | "GET" | "PUT" | "DELETE",
		lambda: cdk.aws_lambda_nodejs.NodejsFunction,
		isAuth?: boolean,
	) {
		let options: apigw.MethodOptions = {};

		if (isAuth) {
			if (!this.authorizer) {
				throw new Error("Authorizer is not set");
			}

			options = {
				authorizer: this.authorizer,
				authorizationType: apigw.AuthorizationType.COGNITO,
			};
		}

		resource.addMethod(
			httpMethod,
			new apigw.LambdaIntegration(lambda),
			options,
		);
	}
}
