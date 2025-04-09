export async function load({ locals, fetch, cookies }) {

	return {
		user: locals?.user || ''
	};
}
