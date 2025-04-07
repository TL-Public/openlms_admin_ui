import { json } from '@sveltejs/kit';
import { BASE_URL } from '$lib/config';

export async function DELETE({ params, cookies }) {
	const { id } = params;
	const authToken = cookies.get('authToken');
	let res;
	try {
		res = await fetch(`${BASE_URL}/apis/v1/courses/${id}`, {
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
