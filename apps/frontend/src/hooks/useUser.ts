"use client";

import { useCallback, useEffect, useState } from "react";
import {
	autoSignIn,
	confirmSignUp,
	getCurrentUser,
	signIn,
	signOut,
	signUp,
} from "aws-amplify/auth";
import { useAppContext } from "../components";
import {
	ILoginFormData,
	IRegisterConfirmation,
	IRegisterFormData,
	ISignInState,
	ISignUpState,
} from "../lib";

export const useUser = () => {
	const [busy, setBusy] = useState(false);
	const { user, setUser, setError, resetError } = useAppContext();

	useEffect(() => {
		const fn = async () => {
			setBusy(true);
			await getUser();
			setBusy(false);
		};

		fn();
	}, [setUser]);

	const getUser = async () => {
		try {
			const user = await getCurrentUser();
			setUser(user);
		} catch {
			setUser(null);
		}
	};

	const login = useCallback(async ({ email, password }: ILoginFormData) => {
		setBusy(true);
		resetError();
		try {
			await signIn({
				username: email,
				password,
				options: {
					userAttributes: {
						email,
					},
				},
			});
			await getUser();
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (e: any) {
			setError(e.toString());
		} finally {
			setBusy(false);
		}
	}, []);

	const register = useCallback(
		async ({
			email,
			password,
			passwordConfirmation,
		}: IRegisterFormData): Promise<ISignUpState | null> => {
			let rtnValue = null;

			setBusy(true);
			resetError();
			try {
				if (password !== passwordConfirmation) {
					throw new Error("Passwords dont't match");
				}

				const { nextStep } = await signUp({
					username: email,
					password,
					options: { userAttributes: { email }, autoSignIn: true },
				});

				rtnValue = nextStep as ISignUpState;
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			} catch (e: any) {
				setError(e.toString());
			} finally {
				setBusy(false);
				return rtnValue;
			}
		},
		[],
	);

	const confirmRegister = async ({
		email,
		verificationCode,
	}: IRegisterConfirmation): Promise<ISignUpState | null> => {
		let rtnValue = null;
		try {
			setBusy(true);
			resetError();
			const { nextStep } = await confirmSignUp({
				confirmationCode: verificationCode,
				username: email,
			});

			rtnValue = nextStep as ISignUpState;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (e: any) {
			setError(e.toString());
		} finally {
			setBusy(false);
			return rtnValue;
		}
	};

	const logout = useCallback(async () => {
		setBusy(true);
		resetError();
		try {
			await signOut();
			setUser(null);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (e: any) {
			setError(e.toString());
		} finally {
			setBusy(false);
		}
	}, []);

	const automaticSignIn =
		useCallback(async (): Promise<ISignInState | null> => {
			let rtnVal = null;
			setBusy(true);
			resetError();
			try {
				const { nextStep } = await autoSignIn();
				await getUser();
				rtnVal = nextStep as ISignInState;
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			} catch (e: any) {
				setError(e.toString());
			} finally {
				setBusy(false);
				return rtnVal;
			}
		}, []);

	return {
		user,
		busy,
		login,
		logout,
		register,
		confirmRegister,
		automaticSignIn,
	};
};
