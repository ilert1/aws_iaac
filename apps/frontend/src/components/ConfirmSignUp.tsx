"use client";
import { confirmSignUp } from "aws-amplify/auth";
import { useForm, SubmitHandler } from "react-hook-form";
import { IRegisterConfirmation, ISignUpState } from "../lib";
import { useUser } from "../hooks";
import { Button, Input, Label } from "./ui";

export const ConfirmSignUp = ({
	onStepChange,
}: {
	onStepChange: (step: ISignUpState) => void;
}) => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<IRegisterConfirmation>();

	const { confirmRegister, busy } = useUser();

	const onSubmit: SubmitHandler<IRegisterConfirmation> = async (data) => {
		try {
			const nextStep = await confirmRegister(data);

			if (nextStep) {
				onStepChange(nextStep);
			}
		} catch (e) {}
	};

	return (
		<form className="flex flex-col space-y-4" onSubmit={handleSubmit(onSubmit)}>
			<div>
				<Label htmlFor="email">Email:</Label>
				<Input
					disabled={busy}
					className="bg-white"
					id="email"
					{...register("email", { required: true })}
				/>
				{errors.email && <span>field is required</span>}
			</div>

			<div>
				<Label htmlFor="verificationCode">Verification Code:</Label>
				<Input
					disabled={busy}
					className="bg-white"
					id="verificationCode"
					type="string"
					{...register("verificationCode", { required: true })}
				/>
				{errors.verificationCode && <span>field is required</span>}
			</div>

			<Button disabled={busy} type="submit">
				{busy ? "Confirming..." : "Confirm"}
			</Button>
		</form>
	);
};
