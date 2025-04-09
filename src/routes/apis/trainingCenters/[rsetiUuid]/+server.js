import { json } from '@sveltejs/kit';
import { BASE_URL } from '$lib/config';

export async function GET({ params, cookies }) {
	const id = params.rsetiUuid;

	const authToken = cookies.get('authToken');
	let res;
	try {
		const options = {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${authToken}`
			}
		};
		res = await fetch(`${BASE_URL}/apis/v1/rsetis/${id}`, options);

		if (!res?.ok) {
			return json({ status: res.status, error: 'Failed to fetch data' }, { status: res.status });
		}

		if (res?.status === 200) {
			const data = await res.json();
			return json(data, { status: res.status });
		}
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
}

export async function PUT({ params, request, cookies }) {
	const id = params.rsetiUuid;

	const authToken = cookies.get('authToken');

	try {
		const req = await request.json();

		const parsedData = JSON.parse(req.data);

		const res = await fetch(`${BASE_URL}/apis/v1/rsetis/${id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${authToken}`
			},
			body: JSON.stringify(parsedData)
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

export async function DELETE({ params, cookies }) {
	const id = params.rsetiUuid;
	const authToken = cookies.get('authToken');
	try {
		const res = await fetch(`${BASE_URL}/apis/v1/rsetis/${id}`, {
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
