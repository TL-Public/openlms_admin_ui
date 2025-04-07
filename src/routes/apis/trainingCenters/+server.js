import { json } from '@sveltejs/kit';
import { BASE_URL } from '$lib/config';

export async function GET({ cookies }) {
	const authToken = cookies.get('authToken');
	try {
		const options = {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${authToken}`
			}
		};
		const res = await fetch(`${BASE_URL}/apis/v1/rsetis`, options);

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

export async function POST({ request, cookies }) {
	const authToken = cookies.get('authToken');
	let res;
	try {
		const req = await request.json();
		const parsedData = JSON.parse(req.data);

		res = await fetch(`${BASE_URL}/apis/v1/rsetis`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${authToken}`
			},
			body: JSON.stringify(parsedData)
		});

		if (!res?.ok) {
			return json({ status: res.status, error: 'Failed to fetch data' }, { status: res.status });
		}

		if (res?.status === 201) {
			const data = await res.json();
			return json(data);
		}
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
}
