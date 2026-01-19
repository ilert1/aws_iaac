import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
	CertificateWrapper,
	RestApiService,
	StaticWebsiteDeploymentService,
	TranslationService,
} from "../constructs";
import { getConfig, lambdaLayersDirPath, lambdasDirPath } from "../helpers";

const config = getConfig();

export class TranslatorServiceStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const domain = config.domain;
		const webUrl = `${config.webSubdomain}.${domain}`;
		const apiUrl = `${config.apiSubdomain}.${domain}`;

		const { certificate, zone } = new CertificateWrapper(
			this,
			"certificateWrapper",
			{
				domain,
				webUrl,
				apiUrl,
			},
		);

		// The API Gateway
		const restApiService = new RestApiService(this, "restApiService", {
			apiUrl,
			certificate,
			zone,
		});

		new TranslationService(this, "translationService", {
			restApiService,
		});

		new StaticWebsiteDeploymentService(this, "staticWebsiteDeploymentService", {
			domain,
			webUrl,
			certificate,
			zone,
		});
	}
}
