"use client";
import { useTranslate } from "@/src/hooks";
import {
	TranslateCard,
	TranslateRequestForm,
	useAppContext,
} from "@/src/components";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/src/components/ui";
import { createRef, useEffect } from "react";
import { ImperativePanelHandle } from "react-resizable-panels";
import { LoadingPage } from "@/src/components/loading";

export default function Home() {
	const { translations, isLoading, deleteTranslation, isDeletingTranslation } =
		useTranslate();
	const { user, selectedTranslation, setSelectedTranslation } = useAppContext();
	const leftPanelRef = createRef<ImperativePanelHandle>();

	useEffect(() => {
		if (!leftPanelRef.current) {
			return;
		}

		if (user) {
			leftPanelRef.current.expand();
		} else {
			leftPanelRef.current.collapse();
		}
	}, [leftPanelRef, user]);

	if (isLoading) {
		return <LoadingPage />;
	}

	return (
		<main className="flex flex-col m-8 h-full">
			<ResizablePanelGroup direction="horizontal">
				<ResizablePanel collapsible ref={leftPanelRef}>
					<div className="bg-gray-900 w-full h-full flex flex-col space-y-1 p-1">
						{translations.map((item) => (
							<TranslateCard
								selected={item.requestId === selectedTranslation?.requestId}
								onSelected={setSelectedTranslation}
								key={item.requestId}
								translateItem={item}
							/>
						))}
					</div>
				</ResizablePanel>
				<ResizableHandle withHandle />
				<ResizablePanel>
					<div className="p-4">
						<TranslateRequestForm />
					</div>
				</ResizablePanel>
			</ResizablePanelGroup>
		</main>
	);
}
