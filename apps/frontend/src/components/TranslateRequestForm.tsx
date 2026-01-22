"use client";

import { ITranslateRequest } from "@sff/shared-types";
import { useForm, SubmitHandler } from "react-hook-form";
import { useTranslate } from "../hooks";
import { Button, Input, Label, Textarea } from "./ui";
import { useAppContext } from "./AppProvider";
import { useEffect } from "react";

export const TranslateRequestForm = () => {
	const { translate, isTranslating } = useTranslate();
	const { selectedTranslation } = useAppContext();

	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm<ITranslateRequest>({
		defaultValues: {
			sourceLang: "en",
			targetLang: "fr",
			sourceText: "",
		},
	});

	useEffect(() => {
		if (selectedTranslation) {
			setValue("sourceText", selectedTranslation?.sourceText || "");
			setValue("sourceLang", selectedTranslation?.sourceLang || "");
			setValue("targetLang", selectedTranslation?.targetLang || "");
		}
	}, [selectedTranslation, setValue]);

	const onSubmit: SubmitHandler<ITranslateRequest> = async (data) => {
		translate(data);
	};

	return (
		<form className="flex flex-col space-y-4" onSubmit={handleSubmit(onSubmit)}>
			<div>
				<Label htmlFor="sourceText">Input text:</Label>
				<Textarea
					id="sourceText"
					className="bg-white"
					{...register("sourceText", { required: true })}
					rows={3}
				/>
				{errors.sourceText && (
					<p className="text-red-500">Source text is required</p>
				)}
			</div>

			<div>
				<Label htmlFor="sourceLang">Input Language:</Label>
				<Input
					className="bg-white"
					id="sourceLang"
					type="text"
					{...register("sourceLang")}
				/>
				{errors.sourceLang && (
					<p className="text-red-500">Source language is required</p>
				)}
			</div>

			<div>
				<Label htmlFor="targetLang">Output Language:</Label>
				<Input
					className="bg-white"
					id="targetLang"
					type="text"
					{...register("targetLang")}
				/>
				{errors.targetLang && (
					<p className="text-red-500">Target language is required</p>
				)}
			</div>

			<Button type="submit">
				{isTranslating ? "Translating..." : "translate"}
			</Button>

			{selectedTranslation && (
				<div>
					<Label htmlFor="targetText">Translated text:</Label>
					<Textarea
						contentEditable={false}
						id="targetText"
						className="bg-white"
						value={selectedTranslation.targetText}
						readOnly
						rows={3}
					/>
				</div>
			)}
		</form>
	);
};
