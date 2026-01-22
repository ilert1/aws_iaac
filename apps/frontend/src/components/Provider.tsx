"use client";
import { ReactNode, useState } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProvider } from "./AppProvider";

export function Provider({ children }: { children: ReactNode }) {
	const [queryClient] = useState(() => new QueryClient());

	return (
		<AppProvider>
			<QueryClientProvider client={queryClient}>
				{children}

				<ReactQueryDevtools initialIsOpen={false} />
			</QueryClientProvider>
		</AppProvider>
	);
}
