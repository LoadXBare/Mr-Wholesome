export const generateId = (length: number): string => {
	const validCharacters = 'aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ0123456789';
	let id = '';

	for (let i = 0; i < length; i++) {
		const randomCharacter = validCharacters.charAt(Math.ceil(Math.random() * validCharacters.length));
		id = id.concat(randomCharacter);
	}

	return id;
};
