import * as clientTranslation from "@aws-sdk/client-translate";
import { ITranslateRequest } from "@sff/shared-types";
import { MissingParameters } from "./appExceptions";

const translateClient = new clientTranslation.TranslateClient({
	region: "us-east-1",
});

export async function translate(props: ITranslateRequest) {
	const { sourceLang, sourceText, targetLang } = props;

	const translateCmd = new clientTranslation.TranslateTextCommand({
		Text: sourceText,
		SourceLanguageCode: sourceLang,
		TargetLanguageCode: targetLang,
	});

	const result = await translateClient.send(translateCmd);

	if (!result.TranslatedText) {
		throw new MissingParameters("TranslationText");
	}

	return result.TranslatedText;
}
