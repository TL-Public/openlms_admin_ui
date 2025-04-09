import { json } from '@sveltejs/kit';

// API to get list of all RSETIs
export async function DELETE({ params }) {
	const { id } = params;
    const headers = {
        'Content-Type': 'application/json'
    };
	try {
		const res = await fetch(
			`http://reap-dev-admin-service.ap-south-1.elasticbeanstalk.com/reap/api/v1/states/${id}`,
			{
				method: 'DELETE',
                headers:headers
			}
		);
		if (!res.ok) {
			throw new Error(404, 'Data Not Found!');
		}

		if(res?.status == 204){
			return json(res);
		}
	} catch (error) {
		return json({ error: error.message });
	}
}
