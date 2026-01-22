import { SignUpOutput, SignInOutput, AuthUser } from "aws-amplify/auth";

export type ISignUpState = SignUpOutput["nextStep"];
export type ISignInState = SignInOutput["nextStep"];
export type IAuthUser = AuthUser;

export type IRegisterFormData = {
	email: string;
	password: string;
	passwordConfirmation: string;
};

export type IRegisterConfirmation = {
	email: string;
	verificationCode: string;
};

export type ILoginFormData = {
	email: string;
	password: string;
};
