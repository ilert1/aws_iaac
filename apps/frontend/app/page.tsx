"use client";
import { useState } from "react";
import {
	ITranslateDbObject,
	ITranslateRequest,
	ITranslateResponse,
} from "@sff/shared-types";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";

// const URL = "https://g9hpa0pahg.execute-api.us-east-1.amazonaws.com/prod";
const URL = "https://api.translateappdemo.site";

async function translateUsersText({
	inputLang,
	outputLang,
	inputText,
}: {
	inputLang: string;
	outputLang: string;
	inputText: string;
}) {
	try {
		const req: ITranslateRequest = {
			sourceLang: inputLang,
			sourceText: inputText,
			targetLang: outputLang,
		};

		const authSession = await fetchAuthSession();
		const token = authSession.tokens?.idToken?.toString();

		const response = await fetch(`${URL}/user`, {
			method: "POST",
			body: JSON.stringify(req),
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		return (await response.json()) as ITranslateResponse;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error(error);
		throw error;
	}
}

async function translatePublicText({
	inputLang,
	outputLang,
	inputText,
}: {
	inputLang: string;
	outputLang: string;
	inputText: string;
}) {
	try {
		const req: ITranslateRequest = {
			sourceLang: inputLang,
			sourceText: inputText,
			targetLang: outputLang,
		};

		const response = await fetch(`${URL}/public`, {
			method: "POST",
			body: JSON.stringify(req),
		});

		return (await response.json()) as ITranslateResponse;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error(error);
		throw error;
	}
}

async function getUsersTranslations() {
	try {
		const authSession = await fetchAuthSession();
		const token = authSession.tokens?.idToken?.toString();

		const response = await fetch(`${URL}/user`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		return (await response.json()) as ITranslateDbObject[];
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error(error);
		throw error;
	}
}

async function deleteUserTranslation(id: string) {
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

		return (await response.json()) as ITranslateDbObject[];
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error(error);
		throw error;
	}
}

export default function Home() {
	const [inputText, setInputText] = useState("");
	const [inputLang, setInputLang] = useState("");
	const [outputLang, setOutputLang] = useState("");
	const [outputText, setOutputText] = useState<ITranslateResponse | null>(null);
	const [translations, setTranslations] = useState<ITranslateDbObject[]>([]);

	return (
		<main className="flex flex-col m-8">
			<form
				className="flex flex-col space-y-4"
				onSubmit={async (event) => {
					event.preventDefault();

					let result = null;

					try {
						const user = await getCurrentUser();

						if (user) {
							result = await translateUsersText({
								inputLang,
								outputLang,
								inputText,
							});
						} else {
							throw new Error("User not logged in");
						}
					} catch (error) {
						result = await translatePublicText({
							inputLang,
							outputLang,
							inputText,
						});
					}

					console.log(result);
					setOutputText(result);
				}}
			>
				<div>
					<label htmlFor="inputText">Input text:</label>
					<textarea
						id="inputText"
						value={inputText}
						onChange={(e) => setInputText(e.target.value)}
						rows={3}
						className="bg-white"
					/>
				</div>

				<div>
					<label htmlFor="inputLang">Input Language:</label>
					<input
						id="inputLang"
						className="bg-white"
						type="text"
						value={inputLang}
						onChange={(e) => setInputLang(e.target.value)}
					/>
				</div>

				<div>
					<label htmlFor="outputLang">Output Language:</label>
					<input
						id="outputLang"
						className="bg-white"
						type="text"
						value={outputLang}
						onChange={(e) => setOutputLang(e.target.value)}
					/>
				</div>

				<button className="btn bg-blue-500" type="submit">
					translate
				</button>
			</form>

			<div>
				<p>Result:</p>
				<pre style={{ whiteSpace: "pre-wrap" }} className="w-full">
					{JSON.stringify(outputText, null, 2)}
				</pre>
			</div>

			<button
				className="btn bg-blue-500"
				type="button"
				onClick={async () => {
					const rtnValue = await getUsersTranslations();
					setTranslations(rtnValue);
				}}
			>
				getTranslations
			</button>
			<div className="flex flex-col space-y-1 p-1">
				{translations.map((item) => (
					<div
						className="flex flex-row justify-between space-x-1 bg-slate-400"
						key={item.requestId}
					>
						<p>
							{item.sourceLang}/{item.sourceText}
						</p>
						<p>
							{item.targetLang}/{item.targetText}
						</p>
						<button
							className="btn p-2 bg-red-500 hover:bg-red-300 rounded-md"
							type="button"
							onClick={async () => {
								const rtnValue = await deleteUserTranslation(item.requestId);
								setTranslations(rtnValue);
							}}
						>
							X
						</button>
					</div>
				))}
			</div>
		</main>
	);
}
