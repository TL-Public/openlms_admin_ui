import { json } from '@sveltejs/kit';

export async function DELETE({ params, cookies }) {
	const { id } = params;
	let res;
	const authToken = cookies.get('authToken');
	try {
		res = await fetch(
			`http://read-admin-api-dev.ap-south-1.elasticbeanstalk.com/apis/v1/faqs/${id}`,
			{
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${authToken}`
				}
			}
		);
		if (!res.ok) {
			return json({ error: 'Failed to delete the FAQ.' }, { status: res.status });
		}
		if (res?.status === 404) {
			return json({ error: 'Data Not Found!' }, { status: res.status });
		}

		// Check for 204 No Content
		if (res?.status === 204) {
			return json({ message: 'Course successfully deleted.' });
		}
	} catch (error) {
		return json({ error: error.message }, { status: res.status });
	}
}

export async function GET({ params, cookies }) {
	const { id } = params;
	let res;
	try {
		const authToken = cookies.get('authToken');
		res = await fetch(
			`http://read-admin-api-dev.ap-south-1.elasticbeanstalk.com/apis/v1/faqs/${id}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${authToken}`
				}
			}
		);
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
		return json({ error: error.message }, { status: res.status });
	}
}
