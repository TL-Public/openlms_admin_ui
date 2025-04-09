import { json } from '@sveltejs/kit';

// API to get list of all RSETIs
export async function DELETE({ params }) {
	const { id } = params;
	try {
		const res = await fetch(
			// `http://reap-dev-admin-service.ap-south-1.elasticbeanstalk.com/reap/api/v1/videos/${id}`,
			{
				method: 'DELETE'
			}
		);
		if (!res.ok) {
			throw new Error(404, 'Data Not Found!');
		}
		const data = await res.json();
		return json(data);
	} catch (error) {
		return json({ error: error.message });
	}
}
