import * as dotenv from "dotenv";
import { IAppConfig } from "./IAppTypes";

export const getConfig = (): IAppConfig => {
	dotenv.config({ path: "../.env" });

	const { AWS_ACCOUNT_ID, AWS_REGION, DOMAIN, API_SUBDOMAIN, WEB_SUBDOMAIN } =
		process.env;

	if (
		!AWS_ACCOUNT_ID ||
		!AWS_REGION ||
		!DOMAIN ||
		!API_SUBDOMAIN ||
		!WEB_SUBDOMAIN
	) {
		throw new Error("Environment variables are not set");
	}

	return {
		awsAcccountId: AWS_ACCOUNT_ID,
		region: AWS_REGION,
		domain: DOMAIN,
		apiSubdomain: API_SUBDOMAIN,
		webSubdomain: WEB_SUBDOMAIN,
	};
};
