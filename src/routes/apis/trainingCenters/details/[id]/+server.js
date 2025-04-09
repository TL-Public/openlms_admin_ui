import { json } from '@sveltejs/kit';

export async function GET({ params, cookies }) {
	const { id } = params;
	const authToken = cookies.get('authToken');

	try {
		const options = {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${authToken}`
			}
		};
		const res = await fetch(
			`http://read-admin-api-dev.ap-south-1.elasticbeanstalk.com/apis/v1/rsetis/${id}`,
			options
		);
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
		return json({ error: error.message });
	}
}
