"use client";
import { useTranslate } from "@/src/hooks";
import { TranslateRequestForm } from "@/src/components";

export default function Home() {
	const { translations, isLoading, deleteTranslation, isDeletingTranslation } =
		useTranslate();

	if (isLoading) {
		return <p>Loading...</p>;
	}

	return (
		<main className="flex flex-col m-8">
			<TranslateRequestForm />
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
								deleteTranslation(item.requestId);
							}}
						>
							{isDeletingTranslation ? "..." : "X"}
						</button>
					</div>
				))}
			</div>
		</main>
	);
}
