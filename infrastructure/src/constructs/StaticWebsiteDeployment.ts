import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cloudfrontOrigins from "aws-cdk-lib/aws-cloudfront-origins";
import * as s3Deploy from "aws-cdk-lib/aws-s3-deployment";
import * as route53Targets from "aws-cdk-lib/aws-route53-targets";
import { frontendDistPath } from "../helpers";

interface StaticWebsiteDeploymentServiceProps extends cdk.StackProps {
	domain: string;
	webUrl: string;
	certificate: acm.Certificate;
	zone: route53.IHostedZone;
}

export class StaticWebsiteDeploymentService extends Construct {
	private restApi: apigw.RestApi;

	constructor(
		scope: Construct,
		id: string,
		props: StaticWebsiteDeploymentServiceProps,
	) {
		super(scope, id);
		const { domain, webUrl: fullUrl, certificate, zone } = props;

		// S3 bucket for website
		const bucket = new s3.Bucket(this, "websiteBucket", {
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			websiteIndexDocument: "index.html",
			websiteErrorDocument: "404.html",
			publicReadAccess: true,
			blockPublicAccess: {
				blockPublicAcls: false,
				blockPublicPolicy: false,
				ignorePublicAcls: false,
				restrictPublicBuckets: false,
			},
			autoDeleteObjects: true,
		});

		const distribution = new cloudfront.Distribution(
			this,
			"websiteCloudFrontDist",
			{
				defaultBehavior: {
					origin: new cloudfrontOrigins.S3StaticWebsiteOrigin(bucket),
					viewerProtocolPolicy:
						cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
				},
				defaultRootObject: "index.html",

				domainNames: [domain, fullUrl],
				certificate: certificate,
			},
		);

		// S3 bucket deployment for website
		new s3Deploy.BucketDeployment(this, "deployWebsite", {
			sources: [s3Deploy.Source.asset(frontendDistPath)],
			destinationBucket: bucket,
			distribution: distribution,
			distributionPaths: ["/*"],
			memoryLimit: 512,
		});

		new route53.ARecord(this, "route53Domain", {
			zone,
			recordName: domain,
			target: route53.RecordTarget.fromAlias(
				new route53Targets.CloudFrontTarget(distribution),
			),
		});

		new route53.ARecord(this, "route53FullUrl", {
			zone,
			recordName: "www",
			target: route53.RecordTarget.fromAlias(
				new route53Targets.CloudFrontTarget(distribution),
			),
		});
	}
}
