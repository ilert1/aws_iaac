export type ITranslateRequest = {
	sourceLang: string;
	targetLang: string;
	sourceText: string;
};

export type ITranslateResponse = {
	timestamp: string;
	targetText: string;
};

export type ITranslatePrimaryKey = {
	username: string;
	requestId: string;
};

export type ITranslateDbResult = ITranslateRequest &
	ITranslateResponse &
	ITranslatePrimaryKey;

export type ITranslateResultList = Array<ITranslateDbResult>;
