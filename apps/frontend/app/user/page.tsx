"use client";
import { LoginForm } from "@/src/components";
import { getCurrentUser, signOut } from "aws-amplify/auth";
import { useEffect, useState } from "react";
import { useUser } from "@/src/hooks";

function Logout({ onSignedOut }: { onSignedOut: () => void }) {
	const { logout } = useUser();

	return (
		<div className="flex w-full">
			<button
				className="btn bg-blue-500 w-full"
				onClick={async () => {
					await logout();
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
		<LoginForm
			onSignedIn={async () => {
				setUser(await getCurrentUser());
			}}
		/>
	);
}
