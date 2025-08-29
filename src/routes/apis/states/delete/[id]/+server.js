import { json } from '@sveltejs/kit';
import { BASE_URL } from '$lib/config';

// API to get list of all RSETIs
export async function DELETE({ params, cookies }) {
	const authToken = cookies.get('authToken');
	const { id } = params;
	const headers = {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${authToken}`
	};

	let res;
	try {
		res = await fetch(`${BASE_URL}/apis/v1/states/${id}`, {
			method: 'DELETE',
			headers: headers
		});

		console.log('res', res)

		if (!res.ok) {
			throw new Error(404, 'Data Not Found!');
		}

		if (res?.status == 204) {
			return new Response(null, { status: 204 });
		}
	} catch (error) {
		return json({ error: error.message }, { status: res.status });
	}
}
