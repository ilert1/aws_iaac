import * as cdk from "aws-cdk-lib";
import * as path from "path";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";
export class TempCdkStackStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const projectRoot = "../";
    const lambdaPath = path.join(projectRoot, "packages/lambdas");

    const translateAccessPolicy = new iam.PolicyStatement({
      actions: ["translate:TranslateText"],
      resources: ["*"],
    });

    const translateLambdaPath = path.resolve(
      path.join(lambdaPath, "translate/index.ts")
    );

    const labmdaFunc = new lambdaNodejs.NodejsFunction(
      this,
      "timeOfDayLambda",
      {
        entry: translateLambdaPath,
        handler: "index",
        runtime: lambda.Runtime.NODEJS_22_X,
        bundling: {
          forceDockerBundling: false,
        },
        initialPolicy: [translateAccessPolicy],
      }
    );

    const restApi = new apigw.RestApi(this, "timeOfDayRestApi");
    restApi.root.addMethod("POST", new apigw.LambdaIntegration(labmdaFunc));
  }
}
