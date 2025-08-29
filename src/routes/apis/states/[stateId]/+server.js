import { json } from '@sveltejs/kit';
import { BASE_URL } from '$lib/config';

export async function GET({ params, cookies }) {

	const { stateId } = params;
	const authToken = cookies.get('authToken');
	let res;

	try {
		res = await fetch(`${BASE_URL}/apis/v1/states/${stateId}`, {
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
	const { stateId } = params;
	let res;
	try {
		const authToken = cookies.get('authToken');
		const body = await request.json();
		console.log(JSON.stringify(body))
		res = await fetch(
			`${BASE_URL}/apis/v1/states/${stateId}`,
			{
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${authToken}`
				},
				body: JSON.stringify(body)
			}
		);
		console.log('res', res)
		if (!res.ok) {
			throw new Error('Failed to edit state.');
		}
		const responseData = await res.json();
		console.log('responseData', responseData)
		return json({ responseData }, { status: res.status });
	} catch (error) {
		return json({ status: res.status, error: error.message }, { status: res.status });
	}
}
