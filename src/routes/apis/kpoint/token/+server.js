import { BASE_URL } from '$lib/config';

export async function POST(event) {
	try {
		const userUuid = event.cookies.get('userUuid');
		let payload = {};

		if (userUuid) {
			payload = { email: `${userUuid}@reaplearn.in`, displayName: userUuid };
		} else {
			payload = { email: 'public@reaplearn.in', displayName: 'public' };
		}
		const options = {
			method: 'POST',
			body: JSON.stringify(payload),
			headers: {
				'Content-Type': 'application/json'
			}
		};
		const res = await fetch(
			`${BASE_URL}/apis/v1/auth/kpoint/token`,
			options
		);
		const data = await res.json();

		return new Response(JSON.stringify(data), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		return new Response(JSON.stringify({ error: error.message }), {
			headers: { 'Content-Type': 'application/json' }
		});
	}
}