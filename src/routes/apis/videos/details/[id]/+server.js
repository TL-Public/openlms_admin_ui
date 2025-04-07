import { json } from '@sveltejs/kit';
import { BASE_URL } from '$lib/config';

export async function GET({ cookies, params, fetch}) {
	const { id } = params;
	const authToken = cookies.get('authToken');
	let res

	if (!authToken) {
		console.error('Missing Auth Token - Unauthorized Access');
	}

	try {
	 res = await fetch(
			` ${BASE_URL}/apis/v1/videos/${id}` , 
			{
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
		if (data?.length ===0 || Object.keys(data)?.length===0) {
			throw new Error('Data not found');
		}
		return json(data);
	} catch (error) {
		return json({ error: error?.message }, {status:res?.status});
	}
}
