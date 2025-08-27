import { json } from '@sveltejs/kit';
import { BASE_URL } from '$lib/config';

export async function GET({ request, fetch, cookies }) {
	let res;
	try {
		const authToken = cookies.get('authToken');
		let queryparams = request.url.split('?');
		let endPoint = `${BASE_URL}/apis/v1/categories`;
		if (queryparams?.length > 1) {
			endPoint += '?' + queryparams[1];
		}
		res = await fetch(endPoint, {
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

export async function POST({ request, params, cookies }) {
	const authToken = cookies.get('authToken');
	let res;

	try {
		const body = await request.json();
		res = await fetch(`${BASE_URL}/apis/v1/categories`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${authToken}`
			},
			body: JSON.stringify(body)
		});

		if (!res.ok) {
			throw new Error('Failed to add Category');
		}

		const responseData = await res.json();

		return json({ responseData }, { status: res.status });
	} catch (error) {
		return json({ error: error.message, status: res.status }, { status: res?.status });
	}
}
