"use client";
import { Amplify } from "aws-amplify";

Amplify.configure(
	{
		Auth: {
			Cognito: {
				// userPoolId: process.env.USER_POOL_ID as string,
				// userPoolClientId: process.env.USER_POOL_CLIENT_ID as string,
				userPoolId: "us-east-1_AzgO7jbFf",
				userPoolClientId: "tg9u235pk175jptt0sjbgpjrl",
			},
		},
	},
	{
		ssr: true,
	},
);

export function ConfigureAmplify() {
	return null;
}
