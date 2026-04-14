import { json } from '@sveltejs/kit';
import { ANALYTICS_URL } from '$lib/config';

export async function GET({ request, fetch, cookies }) {
	let res;
	const authToken = cookies.get('authToken');
	try {
		let queryparams = request.url.split('?');
		let endPoint = `${ANALYTICS_URL}/api/v1/analytics/trainees/onboard-trends-by-category`;
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
		return json({ status: res.status, error: error.message }, { status: res?.status || 500 });
	}
}
