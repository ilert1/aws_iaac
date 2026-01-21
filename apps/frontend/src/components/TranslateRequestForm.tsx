"use client";
import { ITranslateRequest } from "@sff/shared-types";
import { useForm, SubmitHandler } from "react-hook-form";
import { useTranslate } from "../hooks";

export const TranslateRequestForm = () => {
	const { translate, isTranslating } = useTranslate();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ITranslateRequest>({
		defaultValues: {
			sourceLang: "en",
			targetLang: "fr",
			sourceText: "",
		},
	});

	const onSubmit: SubmitHandler<ITranslateRequest> = async (data) => {
		translate(data);
	};

	return (
		<form className="flex flex-col space-y-4" onSubmit={handleSubmit(onSubmit)}>
			<div>
				<label htmlFor="sourceText">Input text:</label>
				<textarea
					id="sourceText"
					{...register("sourceText", { required: true })}
					rows={3}
					className="bg-white"
				/>
				{errors.sourceText && (
					<p className="text-red-500">Source text is required</p>
				)}
			</div>

			<div>
				<label htmlFor="sourceLang">Input Language:</label>
				<input
					id="sourceLang"
					className="bg-white"
					type="text"
					{...register("sourceLang")}
				/>
				{errors.sourceLang && (
					<p className="text-red-500">Source language is required</p>
				)}
			</div>

			<div>
				<label htmlFor="targetLang">Output Language:</label>
				<input
					id="targetLang"
					className="bg-white"
					type="text"
					{...register("targetLang")}
				/>
				{errors.targetLang && (
					<p className="text-red-500">Target language is required</p>
				)}
			</div>

			<button className="btn bg-blue-500" type="submit">
				{isTranslating ? "Translating..." : "translate"}
			</button>
		</form>
	);
};
