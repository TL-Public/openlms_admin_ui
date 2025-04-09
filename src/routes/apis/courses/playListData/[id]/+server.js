import { json } from '@sveltejs/kit';

export async function GET({ params }) {
	const { id } = params;
	try {
		const res = await fetch(
			`http://reap-demo-env1.ap-south-1.elasticbeanstalk.com/reap/api/v1/channels/${id}`
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
