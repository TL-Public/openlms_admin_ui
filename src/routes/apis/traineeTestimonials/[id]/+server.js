import { json } from '@sveltejs/kit';
import { BASE_URL } from '$lib/config';

export async function DELETE({ params, cookies }) {
	const { id } = params;
	let res;
	const authToken = cookies.get('authToken');
	try {
		res = await fetch(`${BASE_URL}/apis/v1/traineetestimonials/${id}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${authToken}`
			}
		});
		if (!res.ok) {
			return json({ error: 'Failed to delete the course.' }, { status: res.status });
		}

		// Check for 204 No Content
		if (res?.status === 204) {
			return new Response(null, { status: 204 });
		}
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
}

export async function GET({ params, cookies }) {
	const { id } = params;
	let res;
	try {
		const authToken = cookies.get('authToken');
		res = await fetch(`${BASE_URL}/apis/v1/traineetestimonials/${id}`, {
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
			return json(data, { status: res.status });
		}
	} catch (error) {
		return json({ error: error.message }, { status: 500});
	}
}
