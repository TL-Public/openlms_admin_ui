import { json } from '@sveltejs/kit';
import { reapUrls, urlPath } from '$config/constants';
export async function GET({ request, fetch, cookies }) {
	let res;
	try {
		const authToken = cookies.get('authToken');
		let queryparams = request.url.split('?');
		let endPoint = `http://read-admin-api-dev.ap-south-1.elasticbeanstalk.com/apis/v1/traineetestimonials`;
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
		if (!res.ok) {
			throw new Error('Failed to fetch data');
		}

		if (res.status != 200) {
			throw new Error('Failed to fetch data');
		}
		const data = await res.json();
		if (data?.length === 0 || Object.keys(data)?.length === 0) {
			throw new Error('Data not found');
		}
		return json(data);
	} catch (error) {
		return json({ status: res.status, error: error.message });
	}
}
