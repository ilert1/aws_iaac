"use client";
import {
	signUp,
	confirmSignUp,
	autoSignIn,
	SignUpOutput,
	SignInOutput,
} from "aws-amplify/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type ISignUpState = SignUpOutput["nextStep"];
type ISignInState = SignInOutput["nextStep"];

function RegistrationForm({
	onStepChange,
}: {
	onStepChange: (step: ISignUpState) => void;
}) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [password2, setPassword2] = useState("");
	const [error, setError] = useState<string | null>(null);

	return (
		<form
			className="flex flex-col space-y-4"
			onSubmit={async (event) => {
				event.preventDefault();
				try {
					if (password !== password2) {
						throw new Error("Passwords dont't match");
					}

					const { nextStep } = await signUp({
						username: email,
						password,
						options: { userAttributes: { email }, autoSignIn: true },
					});

					console.log(nextStep.signUpStep);
					onStepChange(nextStep);
				} catch (e: any) {
					setError(e.toString());
				}
			}}
		>
			<div>
				<label htmlFor="email">E-mail:</label>
				<input
					id="email"
					className="bg-white"
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
			</div>
			<div>
				<label htmlFor="password">Password:</label>
				<input
					id="password"
					className="bg-white"
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
			</div>
			<div>
				<label htmlFor="password2">Retype password:</label>
				<input
					id="password2"
					className="bg-white"
					type="password"
					value={password2}
					onChange={(e) => setPassword2(e.target.value)}
				/>
			</div>

			<button className="btn bg-blue-500" type="submit">
				Register
			</button>

			<Link className="hover:underline" href={"/user"}>
				Login
			</Link>
			{error && <p className="text-red-600 font-bold">{error}</p>}
		</form>
	);
}

function ConfirmSignUp({
	onStepChange,
}: {
	onStepChange: (step: ISignUpState) => void;
}) {
	const [verificationCode, setVerificationCode] = useState("");
	const [email, setEmail] = useState("");

	return (
		<form
			className="flex flex-col space-y-4"
			onSubmit={async (event) => {
				event.preventDefault();
				try {
					const { nextStep } = await confirmSignUp({
						username: email,
						confirmationCode: verificationCode,
					});
					console.log(nextStep);
					onStepChange(nextStep);
				} catch (error) {
					console.log(error);
				}
			}}
		>
			<div>
				<label htmlFor="email">E-mail:</label>
				<input
					id="email"
					className="bg-white"
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
			</div>
			<div>
				<label htmlFor="verificationCode">Verification code:</label>
				<input
					id="verificationCode"
					className="bg-white"
					type="text"
					value={verificationCode}
					onChange={(e) => setVerificationCode(e.target.value)}
				/>
			</div>

			<button className="btn bg-blue-500" type="submit">
				Confirm
			</button>
		</form>
	);
}

function AutoSignIn({
	onStepChange,
}: {
	onStepChange: (step: ISignInState) => void;
}) {
	useEffect(() => {
		async function asyncSignIn() {
			const { nextStep } = await autoSignIn();
			console.log(nextStep);
			onStepChange(nextStep);
		}
		asyncSignIn();
	}, [onStepChange]);

	return <div>Signing in...</div>;
}

export default function RegisterPage() {
	const router = useRouter();
	const [step, setStep] = useState<ISignUpState | ISignInState | null>(null);

	useEffect(() => {
		if (!step) return;

		if ((step as ISignInState).signInStep === "DONE") {
			router.push("/");
		}
	}, [step, router]);

	if (step) {
		if ((step as ISignUpState).signUpStep === "CONFIRM_SIGN_UP") {
			return <ConfirmSignUp onStepChange={setStep} />;
		}
		if ((step as ISignUpState).signUpStep === "COMPLETE_AUTO_SIGN_IN") {
			return <AutoSignIn onStepChange={setStep} />;
		}
	}

	return <RegistrationForm onStepChange={setStep} />;
}
