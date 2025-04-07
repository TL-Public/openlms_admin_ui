import { json } from '@sveltejs/kit';
import { BASE_URL } from '$lib/config';

export async function GET({ params, cookies }) {
	const { id } = params;
	let res;
	const authToken = cookies.get('authToken');
	try {
		res = await fetch(`${BASE_URL}/apis/v1/trainee-profiles/${params.id}`, {
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
		return json({ status: res.status, error: error.message }, { status: 500 });
	}
}

export async function DELETE({ cookies, params }) {
	const authToken = cookies.get('authToken');
	let res;
	try {
		res = await fetch(`${BASE_URL}/apis/v1/trainee-profiles/${params.id}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${authToken}`
			}
		});

		if (!res.ok || res.status != 204) {
			return json({ message: 'Failed to delete trainee' }, { status: res.status });
		}

		if (res?.status === 204) {
			return new Response(null, { status: 204 });
		}
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
}
