import { json } from '@sveltejs/kit';
import { BASE_URL } from '$lib/config';

export async function POST({ request, params, cookies }) {
	const { id } = params;
	const authToken = cookies.get('authToken');
	let res;

	try {
		const body = await request.json();

		res = await fetch(`${BASE_URL}/apis/v1/courses/${id}/chapters`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${authToken}`
			},
			body: JSON.stringify(body)
		});

		if (!res?.ok) {
			return json({ status: res.status, error: 'Failed to add chapter' }, { status: res.status });
		}

		if (res?.status === 201) {
			const data = await res.json();
			return json(data, { status: res.status });
		}
	} catch (error) {
		return json({ error: error.message, status: res.status }, { status: 500 });
	}
}
