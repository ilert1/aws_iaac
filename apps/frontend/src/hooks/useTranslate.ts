"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { translateApi } from "@/src/lib";
import { useEffect, useState } from "react";
import { AuthUser, getCurrentUser } from "aws-amplify/auth";
import { ITranslateRequest } from "@sff/shared-types";

export const useTranslate = () => {
	const [user, setUser] = useState<AuthUser | null | undefined>(null);

	const queryClient = useQueryClient();
	const queryKey = ["translate", user ? user.userId : ""];

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

	const translateQuery = useQuery({
		queryKey,
		queryFn: () => {
			console.log("Translate query fn");
			if (!user) return [];
			return translateApi.getUsersTranslations();
		},
		enabled: !!user,
	});

	const translateMutation = useMutation({
		mutationFn: async (request: ITranslateRequest) => {
			try {
				if (user) {
					return translateApi.translateUsersText(request);
				} else {
					return translateApi.translatePublicText(request);
				}
			} catch (error) {
				throw new Error("");
			}
		},
		onSuccess: (result) => {
			if (translateQuery.data && result) {
				queryClient.setQueryData(
					queryKey,
					translateQuery.data.concat([result]),
				);
			}
		},
	});

	const deleteTranslationMutation = useMutation({
		mutationFn: async (requestId: string) => {
			if (!user) {
				return;
			}

			return translateApi.deleteUserTranslation(requestId);
		},
		onSuccess: (result) => {
			if (translateQuery.data && result) {
				queryClient.setQueryData(
					queryKey,
					translateQuery.data.filter(
						(item) => item.requestId !== result?.requestId,
					),
				);
			}
		},
	});

	return {
		translations: !translateQuery.data ? [] : translateQuery.data,
		isLoading: translateQuery.isLoading,
		translate: translateMutation.mutate,
		isTranslating: translateMutation.isPending,
		deleteTranslation: deleteTranslationMutation.mutate,
		isDeletingTranslation: deleteTranslationMutation.isPending,
	};
};
