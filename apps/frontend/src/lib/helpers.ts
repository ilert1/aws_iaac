export const getDate = (requestId: number) => {
	const date = new Date(requestId);
	return date.toLocaleDateString();
};

export const getTime = (requestId: number) => {
	const date = new Date(requestId);
	return date.toLocaleTimeString();
};