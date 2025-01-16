import { json } from '@sveltejs/kit';

export async function PUT({ params, request, cookies }) {
	const id = params.rsetiUuid;
	console.log('id', id)
	const authToken = cookies.get('authToken');

	try {
		const req = await request.json();

		const parsedData = JSON.parse(req.data);
		console.log('parsed data',JSON.stringify(parsedData))

		const res = await fetch(
			`http://read-admin-api-dev.ap-south-1.elasticbeanstalk.com/apis/v1/rsetis/${id}`,
			{
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${authToken}`
				},
				body: JSON.stringify(parsedData)
			}
		);
console.log('res', res)
		if (!res.ok) {
			throw new Error('Failed to add edit rseti data');
		}
		const responseData = await res.json();

		return json(responseData);
	} catch (error) {
		console.log('Failed to edit rseti data ', error.message);
	}
}

export async function DELETE({ params, cookies }) {
	const id = params.rsetiUuid;
	const authToken = cookies.get('authToken');
	try {
		const res = await fetch(
			`http://read-admin-api-dev.ap-south-1.elasticbeanstalk.com/apis/v1/rsetis/${id}`,
			{
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${authToken}`
				}
			}
		);
		if (!res.ok) {
			throw new Error('Failed to delete rseti data');
		}
		// const responseData = await res.json();
		return res;
	} catch (error) {
		console.log('Failed to delete rseti data ', error.message);
	}
}
