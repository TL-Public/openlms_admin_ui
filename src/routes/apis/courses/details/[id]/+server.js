import { json } from '@sveltejs/kit';
import { BASE_URL } from '$lib/config';

export async function GET({ params, cookies }) {
	const { id } = params;
	let res;
	const authToken = cookies.get('authToken');
	try {
		res = await fetch(`${BASE_URL}/apis/v1/courses/${id}`, {
			method: 'GET',
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
		return json({ error: error.message }, { status: 500 });
	}
}

export async function PUT({ request, params, url, cookies }) {
	const { id } = params;
	let res;
	try {
		const authToken = cookies.get('authToken');
		const body = await request.json();
		res = await fetch(`${BASE_URL}/apis/v1/courses/${id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${authToken}`
			},
			body: JSON.stringify(body)
		});

		if (!res?.ok) {
			return json({ status: res.status, error: 'Failed to edit course' }, { status: res.status });
		}

		if (res?.status === 200) {
			const data = await res.json();
			return json(data, { status: request.status });
		}
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
}
