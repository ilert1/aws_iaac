import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53Targets from "aws-cdk-lib/aws-route53-targets";

interface RestApiServiceProps extends cdk.StackProps {
	apiUrl: string;
	certificate: acm.Certificate;
	zone: route53.IHostedZone;
}

export class RestApiService extends Construct {
	private restApi: apigw.RestApi;

	constructor(scope: Construct, id: string, props: RestApiServiceProps) {
		super(scope, id);
		const { apiUrl, certificate, zone } = props;

		// The API Gateway
		this.restApi = new apigw.RestApi(this, "translateRestApi", {
			domainName: {
				domainName: apiUrl,
				certificate,
			},
		});

		new route53.ARecord(this, "apiDns", {
			zone,
			recordName: "api",
			target: route53.RecordTarget.fromAlias(
				new route53Targets.ApiGateway(this.restApi),
			),
		});
	}

	addMethod(
		httpMethod: "POST" | "GET" | "PUT" | "DELETE",
		lambda: cdk.aws_lambda_nodejs.NodejsFunction,
	) {
		this.restApi.root.addMethod(
			httpMethod,
			new apigw.LambdaIntegration(lambda),
		);
	}
}
