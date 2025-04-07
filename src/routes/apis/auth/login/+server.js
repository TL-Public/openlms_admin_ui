import { json } from '@sveltejs/kit';
import { BASE_URL } from '$lib/config';

export async function POST({ request }) {
	let res;
	try {
		const body = await request.json();
		res = await fetch(
			`${BASE_URL}/apis/v1/auth/signin`,
			{
				method: 'POST',
				body: JSON.stringify(body),
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);

		if (!res.ok) {
			return json({ success: false }, { status: res.status });
		}

		if (res.status != 200) {
			return json({ success: false }, { status: res.status });
		}

		const user = await res.json();
		return json(user, { status: res.status });
	} catch (error) {
		console.log('error', error, res);
		return json({ success: false, error: error.message }, { status: res.status });
	}
}
