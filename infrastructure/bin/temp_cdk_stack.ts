#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { TempCdkStackStack } from "../lib/temp_cdk_stack-stack";

const app = new cdk.App();

// Command to bootstrap on current region
// aws sts get-caller-identity --query Account --output text
// cdk bootstrap aws://359671834320/eu-east-1

new TempCdkStackStack(app, "TempCdkStackStack", {
	env: { account: "359671834320", region: "us-east-1" },
});
