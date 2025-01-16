import { json } from '@sveltejs/kit';

export async function GET({ cookies }) {
	try {
		const authToken = cookies.get('authToken');
		const res = await fetch(
			`http://reap-demo-env1.ap-south-1.elasticbeanstalk.com/reap/api/v1/playlists/fetchAll?email=sinu.jamal@tensorlogic.ai&displayName=Sinujamal@123`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${authToken}`
				}
			}
		);
		if (!res.ok) {
			throw new Error(404, 'Data Not Found!');
		}
		if (res.status !== 200) {
			throw new Error(404, 'Data Not Found!');
		}
		const data = await res.json();
		if (data?.length === 0 || Object.keys(data)?.length === 0) {
			throw new Error('Data not found');
		}
		return json(data);
	} catch (error) {
		return json({ error: error.message });
	}
}
