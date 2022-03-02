export const generateId = (length: number) => {
	const validCharacters = 'aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ0123456789';
	let id = '';

	for (let i = 1; i < length + 1; i++) {
		id = id.concat(validCharacters.charAt(Math.ceil(Math.random() * validCharacters.length)));
	}

	return id;
};
