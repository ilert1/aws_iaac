"use client";
import { getCurrentUser, signIn, signOut } from "aws-amplify/auth";
import Link from "next/link";
import { useEffect, useState } from "react";

function Login({ onSignedIn }: { onSignedIn: () => void }) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);

	return (
		<form
			className="flex flex-col space-y-4"
			onSubmit={async (event) => {
				event.preventDefault();
				try {
					await signIn({
						username: email,
						password,
						options: {
							userAttributes: { email },
						},
					});

					onSignedIn();
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
				} catch (e: any) {
					setError(e.toString());
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
				<label htmlFor="password">Password:</label>
				<input
					id="password"
					className="bg-white"
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
			</div>

			<button className="btn bg-blue-500" type="submit">
				Login
			</button>

			<Link className="hover:underline" href={"/register"}>
				Register
			</Link>
			{error && <p className="text-red-600 font-bold">{error}</p>}
		</form>
	);
}

function Logout({ onSignedOut }: { onSignedOut: () => void }) {
	return (
		<div className="flex w-full">
			<button
				className="btn bg-blue-500 w-full"
				onClick={async () => {
					await signOut();
					onSignedOut();
				}}
			>
				Logout
			</button>
		</div>
	);
}

export default function UserPage() {
	const [user, setUser] = useState<object | null | undefined>(undefined);

	useEffect(() => {
		async function fetchUser() {
			try {
				const currUser = await getCurrentUser();
				console.log(currUser);
				setUser(currUser);
			} catch (error) {
				setUser(null);
				console.log(error);
			}
		}

		fetchUser();
	}, []);

	if (user === undefined) {
		return <p>Loading...</p>;
	}

	if (user) {
		return (
			<Logout
				onSignedOut={() => {
					setUser(null);
				}}
			/>
		);
	}

	return (
		<Login
			onSignedIn={async () => {
				setUser(await getCurrentUser());
			}}
		/>
	);
}
