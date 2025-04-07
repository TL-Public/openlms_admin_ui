import { json } from '@sveltejs/kit';
import { BASE_URL } from '$lib/config';

export async function PUT({ request, params, url, cookies }) {
    let id = params.id
	let res;
	try {
		const authToken = cookies.get('authToken');
		const body = await request.json();
  
		res = await fetch(`${BASE_URL}/apis/v1/videos/${id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${authToken}`
			},
			body: JSON.stringify(body)
		});


		if (!res?.ok) {
			return json({ status: res?.status, error: 'Failed to edit video' }, { status: res?.status });
		}

		if (res?.status === 200) {
			const data = await res?.json();
			return json(data);
		}
	} catch (error) {
		return json({ error: error.message, status: res?.status }, { status: 500 });
	}
}
