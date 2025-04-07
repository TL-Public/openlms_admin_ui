import { json } from '@sveltejs/kit';
import { BASE_URL } from '$lib/config';

export async function DELETE({ params, cookies }) {
	const { id } = params;
	let res;
	const authToken = cookies.get('authToken');
	try {
		res = await fetch(`${BASE_URL}/apis/v1/faqs/${id}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${authToken}`
			}
		});

		if (!res?.ok) {
			return json(
				{ status: res.status, error: 'Failed to delete the FAQ.' },
				{ status: res.status }
			);
		}

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
		res = await fetch(`${BASE_URL}/apis/v1/faqs/${id}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${authToken}`
			}
		});

		if (!res?.ok) {
			return json(
				{ status: res.status, error: 'Failed to fetch details.' },
				{ status: res.status }
			);
		}

		if (res?.status === 200) {
			const data = await res.json();
			return json(data);
		}
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
}
