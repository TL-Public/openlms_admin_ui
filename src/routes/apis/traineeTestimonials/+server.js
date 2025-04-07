import { json } from '@sveltejs/kit';
import { BASE_URL } from '$lib/config';

export async function GET({ request, fetch, cookies }) {
	let res;
	try {
		const authToken = cookies.get('authToken');
		let queryparams = request.url.split('?');
		let endPoint = `${BASE_URL}/apis/v1/traineetestimonials`;
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
			return json(data, { status: res.status });
		}
	} catch (error) {
		return json({ status: res.status, error: error.message }, { status: 500 });
	}
}
