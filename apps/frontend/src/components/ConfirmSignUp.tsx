"use client";
import { confirmSignUp } from "aws-amplify/auth";
import { useForm, SubmitHandler } from "react-hook-form";
import { IRegisterConfirmation, ISignUpState } from "../lib";

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

	const onSubmit: SubmitHandler<IRegisterConfirmation> = async ({
		email,
		verificationCode,
	}) => {
		try {
			const { nextStep } = await confirmSignUp({
				confirmationCode: verificationCode,
				username: email,
			});

			console.log(nextStep.signUpStep);
			onStepChange(nextStep);
		} catch (e) {}
	};

	return (
		<form className="flex flex-col space-y-4" onSubmit={handleSubmit(onSubmit)}>
			<div>
				<label htmlFor="email">Email:</label>
				<input
					className="bg-white"
					id="email"
					{...register("email", { required: true })}
				/>
				{errors.email && <span>field is required</span>}
			</div>

			<div>
				<label htmlFor="verificationCode">Verification Code:</label>
				<input
					className="bg-white"
					id="verificationCode"
					type="string"
					{...register("verificationCode", { required: true })}
				/>
				{errors.verificationCode && <span>field is required</span>}
			</div>

			<button className="btn bg-blue-500" type="submit">
				{"confirm"}
			</button>
		</form>
	);
};
