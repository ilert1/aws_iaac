"use client";
import { ITranslateRequest } from "@sff/shared-types";
import { useForm, SubmitHandler } from "react-hook-form";
import { useTranslate } from "../hooks";
import { IRegisterFormData, ISignUpState } from "../lib";
import { signUp } from "aws-amplify/auth";
import Link from "next/link";

export const RegisterForm = ({
	onStepChange,
}: {
	onStepChange: (step: ISignUpState) => void;
}) => {
	const { translate, isTranslating } = useTranslate();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<IRegisterFormData>({
		defaultValues: {
			email: "",
			password: "",
			passwordConfirmation: "",
		},
	});

	const onSubmit: SubmitHandler<IRegisterFormData> = async (data) => {
		const { email, password, passwordConfirmation } = data;

		try {
			if (password !== passwordConfirmation) {
				throw new Error("Passwords dont't match");
			}

			const { nextStep } = await signUp({
				username: email,
				password,
				options: { userAttributes: { email }, autoSignIn: true },
			});

			console.log(nextStep.signUpStep);
			onStepChange(nextStep);
		} catch (e: any) {}
	};

	return (
		<form className="flex flex-col space-y-4" onSubmit={handleSubmit(onSubmit)}>
			<div>
				<label htmlFor="email">E-mail:</label>
				<input
					id="email"
					{...register("email", { required: true })}
					className="bg-white"
				/>
				{errors.email && <p className="text-red-500">Email is required</p>}
			</div>

			<div>
				<label htmlFor="password">Password:</label>
				<input
					id="password"
					className="bg-white"
					type="password"
					{...register("password", { required: true })}
				/>
				{errors.password && (
					<p className="text-red-500">Password is required</p>
				)}
			</div>

			<div>
				<label htmlFor="passwordConfirmation">Retype password:</label>
				<input
					id="passwordConfirmation"
					className="bg-white"
					type="password"
					{...register("passwordConfirmation", { required: true })}
				/>
				{errors.passwordConfirmation && (
					<p className="text-red-500">Target language is required</p>
				)}
			</div>

			<button className="btn bg-blue-500" type="submit">
				{"Register"}
			</button>
			<Link className="hover:underline" href={"/user"}>
				Login
			</Link>
		</form>
	);
};
