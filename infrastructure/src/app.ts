#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { TranslatorServiceStack } from "./stacks";
import { getConfig } from "./helpers";

const app = new cdk.App();
const config = getConfig();

// Command to bootstrap on current region
// aws sts get-caller-identity --query Account --output text
// cdk bootstrap aws://359671834320/eu-east-1

new TranslatorServiceStack(app, "TranslatorService", {
	env: { account: config.awsAcccountId, region: config.region },
});
