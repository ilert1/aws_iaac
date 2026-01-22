"use client";

import { useContext, createContext, useState, useMemo } from "react";
import { toast, Toaster } from "sonner";
import { IAuthUser } from "@/src/lib/types";

interface IAppContext {
	user: IAuthUser | null | undefined;
	setUser: (user: IAuthUser | null | undefined) => void;
	setError: (msg: string) => void;
	resetError: () => void;
}

const AppContext = createContext<IAppContext | null>({
	user: undefined,
	setUser: (user) => {},
	setError: (msg) => {},
	resetError: () => {},
});

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
	const [user, setUser] = useState<IAuthUser | null | undefined>(undefined);

	const initialValue = useMemo(
		() => ({
			user,
			setUser,
			setError: (msg: string) => {
				toast.error("Error", { description: msg });
			},
			resetError: () => {
				console.error("Clear error");
				toast.dismiss();
			},
		}),
		[user],
	);

	return (
		<AppContext.Provider value={initialValue as IAppContext}>
			{children}
			<Toaster />
		</AppContext.Provider>
	);
};

export const useAppContext = () => {
	const context = useContext(AppContext);
	if (!context) {
		throw new Error("useAppContext must be used within AppProvider");
	}
	return context;
};
