import { json } from '@sveltejs/kit';

export async function GET({ params, request, cookies }) {
	const id = params.id;
	let res
	const authToken = cookies.get('authToken');
	try {
		const options = {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${authToken}`
			}
		};
		 res = await fetch(
			`http://read-admin-api-dev.ap-south-1.elasticbeanstalk.com/apis/v1/rsetis/${id}/courses`,
			options
		);
		if (!res.ok || res.status != 200) {
			throw new Error('Failed to get courses data');
		}
		const data = await res.json();

		if (data?.length === 0 || Object.keys(data)?.length === 0) {
			throw new Error('Data not found');
		}
		return json(data);
	} catch (error) {
		return json({ error: error.message },{status: res.status});
	}
}
