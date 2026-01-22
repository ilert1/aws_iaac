"use client";
import React, { useContext, createContext, useState } from "react";
import { ITranslateDbResult } from "@sff/shared-types";
import { IAuthUser } from "../lib";
import { toast } from "sonner";

type IAppContext = {
	user: IAuthUser | null | undefined;
	setUser: (user: IAuthUser | null) => void;
	setError: (msg: string) => void;
	resetError: () => void;
	selectedTranslation: ITranslateDbResult | null;
	setSelectedTranslation: (item: ITranslateDbResult) => void;
};

const AppContext = createContext<IAppContext>({
	user: null,
	setUser: (user) => {},
	setError: (msg) => {},
	resetError: () => {},
	selectedTranslation: null,
	setSelectedTranslation: (item: ITranslateDbResult) => {},
});

function useInitialApp(): IAppContext {
	const [selectedTranslation, setSelectedTranslation] =
		useState<ITranslateDbResult | null>(null);
	const [user, setUser] = useState<IAuthUser | null | undefined>(undefined);

	return {
		user,
		setUser,
		setError: (msg) => {
			// console.error(msg);
			toast.error("Error", {
				description: msg,
			});
		},
		resetError: () => {
			// console.error("clear error");
			toast.dismiss();
		},
		selectedTranslation,
		setSelectedTranslation,
	};
}

export function AppProvider({ children }: { children: React.ReactNode }) {
	const initialValue = useInitialApp();
	return (
		<AppContext.Provider value={initialValue}>{children}</AppContext.Provider>
	);
}

export const useAppContext = () => {
	const context = useContext(AppContext);
	if (!context) {
		throw new Error("useAppContext must be used within AppProvider");
	}
	return context;
};
