import { BASE_URL } from '$lib/config';
import { error, json } from '@sveltejs/kit';

export async function DELETE({ params, cookies }) {
	const { id } = params;

	const authToken = cookies.get('authToken');
	let res;
	try {
		res = await fetch(`${BASE_URL}/apis/v1/app-config/${id}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${authToken}`
			}
		});

		if (!res.ok) {
			return json({ error: 'Failed to delete app configuration.' }, { status: res.status });
		}
		if (res?.status === 404) {
			return json({ error: 'Data Not Found' }, { status: res.status });
		}

		// Check for 204 No Content
		if (res?.status === 204) {
			return new Response(null, { status: 204 });
		}
	} catch (error) {
		return json({ error: error.message }, { status: res.status });
	}
}

export async function PUT({ request, params, url, cookies }) {
	const { id } = params;
	let res;
	try {
		const authToken = cookies.get('authToken');
		const body = await request.json();
		res = await fetch(
			`${BASE_URL}/apis/v1/app-config/${id}`,
			{
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${authToken}`
				},
				body: JSON.stringify(body)
			}
		);
		if (!res.ok) {
			throw new Error('Failed to edit app configuration.');
		}
		const responseData = await res.json();
		return json({ responseData }, { status: res.status });
	} catch (error) {
		return json({ status: res.status, error: error.message }, { status: res.status });
	}
}
