"use client";
import { ConfirmSignUp, RegisterForm } from "@/src/components";
import { ISignInState, ISignUpState } from "@/src/lib";
import { autoSignIn } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

	return <RegisterForm onStepChange={setStep} />;
}
