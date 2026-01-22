"use client";
import { useForm, SubmitHandler } from "react-hook-form";
import { useTranslate, useUser } from "../hooks";
import { IRegisterFormData, ISignUpState } from "../lib";
import Link from "next/link";
import { Button, Input, Label } from "./ui";

export const RegisterForm = ({
	onStepChange,
}: {
	onStepChange: (step: ISignUpState) => void;
}) => {
	const { translate, isTranslating } = useTranslate();
	const { register: accountRegister, busy } = useUser();

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
		const nextStep = await accountRegister(data);

		if (nextStep) {
			onStepChange(nextStep);
		}
	};

	return (
		<form className="flex flex-col space-y-4" onSubmit={handleSubmit(onSubmit)}>
			<div>
				<Label htmlFor="email">E-mail:</Label>
				<Input
					disabled={busy}
					id="email"
					{...register("email", { required: true })}
					className="bg-white"
				/>
				{errors.email && <p className="text-red-500">Email is required</p>}
			</div>

			<div>
				<Label htmlFor="password">Password:</Label>
				<Input
					disabled={busy}
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
				<Label htmlFor="passwordConfirmation">Retype password:</Label>
				<Input
					disabled={busy}
					id="passwordConfirmation"
					className="bg-white"
					type="password"
					{...register("passwordConfirmation", { required: true })}
				/>
				{errors.passwordConfirmation && (
					<p className="text-red-500">Target language is required</p>
				)}
			</div>

			<Button disabled={busy} type="submit">
				{busy ? "Registering..." : "Register"}
			</Button>
		</form>
	);
};
