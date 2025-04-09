import { json } from '@sveltejs/kit';

export async function GET({ params, cookies }) {
	const { id } = params;
	let res;
	const authToken = cookies.get('authToken');
	try {
		res = await fetch(
			`http://read-admin-api-dev.ap-south-1.elasticbeanstalk.com/apis/v1/users/${params.id}`,
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
		return json({ status: res.status, error: error.message }, { status: res.status });
	}
}

export async function DELETE({ cookies, params }) {
	const authToken = cookies.get('authToken');
	let res;
	try {
		res = await fetch(
			`http://read-admin-api-dev.ap-south-1.elasticbeanstalk.com/apis/v1/users/${params.id}`,
			{
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${authToken}`
				}
			}
		);

		if (!res.ok) {
			throw new Error('Failed to delete data, api response not ok');
		}
		if (res.status != 204) {
			throw new Error('Failed to delete data, api response status code not 204');
		}

		return json({ message: 'User deleted successfully' });
	} catch (error) {
		return json({ error: error.message }, { status: res.status });
	}
}
