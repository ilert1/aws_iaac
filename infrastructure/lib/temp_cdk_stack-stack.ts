import * as cdk from "aws-cdk-lib";
import * as path from "path";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3Deploy from "aws-cdk-lib/aws-s3-deployment";
// import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
// import * as cloudfrontOrigins from "aws-cdk-lib/aws-cloudfront-origins";

export class TempCdkStackStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // project paths
    const projectRoot = "../";
    const lambdaPath = path.join(projectRoot, "packages/lambdas");
    const lambdaLayersPath = path.join(projectRoot, "packages/lambda-layers");

    // DynamoDb
    const table = new dynamodb.Table(this, "translations", {
      tableName: "translation",
      partitionKey: { name: "requestId", type: dynamodb.AttributeType.STRING },
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
      ],
      resources: ["*"],
    });

    const translateLambdaPath = path.resolve(
      path.join(lambdaPath, "translate/index.ts")
    );

    const utilsLayerPath = path.resolve(
      path.join(lambdaLayersPath, "utils-lambda-layer")
    );

    const utilsLambdaLayer = new lambda.LayerVersion(this, "utilsLambdaLayer", {
      code: lambda.Code.fromAsset(utilsLayerPath),
      compatibleRuntimes: [lambda.Runtime.NODEJS_22_X],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // The API Gateway
    const restApi = new apigw.RestApi(this, "translateRestApi");

    // The translation lambda
    const translateLambda = new lambdaNodejs.NodejsFunction(
      this,
      "translateLambda",
      {
        entry: translateLambdaPath,
        handler: "translate",
        runtime: lambda.Runtime.NODEJS_22_X,

        initialPolicy: [translateServicePolicy, translateTablePolicy],
        layers: [utilsLambdaLayer],
        bundling: {
          externalModules: ["/opt/nodejs/utils-lambda-layer"],
        },
        environment: {
          TRANSLATION_TABLE_NAME: table.tableName,
          TRANSLATION_PARTITION_KEY: "requestId",
        },
      }
    );

    restApi.root.addMethod(
      "POST",
      new apigw.LambdaIntegration(translateLambda)
    );

    // Get translations lambda
    const getTranslationsLambda = new lambdaNodejs.NodejsFunction(
      this,
      "getTranslationsLambda",
      {
        entry: translateLambdaPath,
        handler: "getTranslations",
        runtime: lambda.Runtime.NODEJS_22_X,
        bundling: {
          forceDockerBundling: false,
        },
        initialPolicy: [translateTablePolicy],
        layers: [utilsLambdaLayer],
        environment: {
          TRANSLATION_TABLE_NAME: table.tableName,
          TRANSLATION_PARTITION_KEY: "requestId",
        },
      }
    );

    restApi.root.addMethod(
      "GET",
      new apigw.LambdaIntegration(getTranslationsLambda)
    );

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

    // const distribution = new cloudfront.Distribution(this, "distro", {
    //   defaultBehavior: {
    //     origin: new cloudfrontOrigins.S3StaticWebsiteOrigin(bucket),
    //     viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    //   },
    //   defaultRootObject: "index.html",
    // });

    // const distribution = new cloudfront.CloudFrontWebDistribution(
    //   this,
    //   "distro",
    //   {
    //     originConfigs: [
    //       {
    //         s3OriginSource: {
    //           s3BucketSource: bucket,
    //         },
    //         behaviors: [
    //           {
    //             isDefaultBehavior: true,
    //           },
    //         ],
    //       },
    //     ],
    //   }
    // );

    // S3 bucket deployment for website
    new s3Deploy.BucketDeployment(this, "deployWebsite", {
      sources: [s3Deploy.Source.asset("../apps/frontend/dist")],
      destinationBucket: bucket,
      // distribution: distribution,
      // distributionPaths: ["/*"],
    });

    // new cdk.CfnOutput(this, "webUrl", {
    //   exportName: "webUrl",
    //   value: `${distribution.domainName}`,
    // });
  }
}
