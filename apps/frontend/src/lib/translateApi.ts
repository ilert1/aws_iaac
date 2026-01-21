import {
	ITranslateDbResult,
	ITranslatePrimaryKey,
	ITranslateRequest,
	ITranslateResultList,
} from "@sff/shared-types";
import { fetchAuthSession } from "aws-amplify/auth";

const URL = "https://api.translateappdemo.site";

export async function translateUsersText(request: ITranslateRequest) {
	try {
		const authSession = await fetchAuthSession();
		const token = authSession.tokens?.idToken?.toString();

		const response = await fetch(`${URL}/user`, {
			method: "POST",
			body: JSON.stringify(request),
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		return (await response.json()) as ITranslateDbResult;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error(error);
		throw error;
	}
}

export async function translatePublicText(request: ITranslateRequest) {
	try {
		const response = await fetch(`${URL}/public`, {
			method: "POST",
			body: JSON.stringify(request),
		});

		return (await response.json()) as ITranslateDbResult;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error(error);
		throw error;
	}
}

export async function getUsersTranslations() {
	try {
		const authSession = await fetchAuthSession();
		const token = authSession.tokens?.idToken?.toString();

		const response = await fetch(`${URL}/user`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		return (await response.json()) as ITranslateResultList;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error(error);
		throw error;
	}
}

export async function deleteUserTranslation(id: string) {
	try {
		const authSession = await fetchAuthSession();
		const token = authSession.tokens?.idToken?.toString();

		const response = await fetch(`${URL}/user`, {
			method: "DELETE",
			headers: {
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ requestId: id }),
		});

		return (await response.json()) as ITranslatePrimaryKey;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error(error);
		throw error;
	}
}
