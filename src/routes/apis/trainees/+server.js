import { json } from '@sveltejs/kit';
import { BASE_URL } from '$lib/config';

export async function GET({ cookies }) {
	const authToken = cookies.get('authToken');
	let res;

	try {
		res = await fetch(`${BASE_URL}/apis/v1/trainee-profiles`, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${authToken}`
			}
		});

		if (!res?.ok) {
			return json({ status: res.status, error: 'Failed to fetch data' }, { status: res.status });
		}

		if (res?.status === 200) {
			const data = await res.json();
			return json(data);
		}
	} catch (error) {
		return json({ status: res.status, error: error.message }, { status: 500 });
	}
}
