import { json } from '@sveltejs/kit';

export async function PUT({ request, params, url, cookies }) {
	let courseUuid = url.searchParams.get('courseUuid');
	let uuid = url.searchParams.get('uuid');
	let res
	try {
		const authToken = cookies.get('authToken');
		const body = await request.json();
		res = await fetch(
			`http://read-admin-api-dev.ap-south-1.elasticbeanstalk.com/apis/v1/courses/${courseUuid}/chapters/${uuid}`,
			{
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${authToken}`
				},
				body: JSON.stringify(body)
			}
		);
		if (!res.ok) {
			throw new Error('Failed to edit chapter');
		}

		const responseData = await res.json();
		return json(responseData);
	} catch (error) {
		return json({ error: error.message, status: res.status });
	}
}

export async function DELETE({ params, url, cookies }) {
	let courseUuid = url.searchParams.get('courseUuid');
	let uuid = url.searchParams.get('uuid');
	try {
		const authToken = cookies.get('authToken');
		const res = await fetch(
			`http://read-admin-api-dev.ap-south-1.elasticbeanstalk.com/apis/v1/courses/${courseUuid}/chapters/${uuid}`,
			{
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${authToken}`
				}
			}
		);
		if (!res.ok) {
			return json({ error: 'Failed to delete chapter.' });
		}
		if (res?.status === 404) {
			return json({ error: 'Data Not Found!' });
		}

		// Check for 204 No Content
		if (res?.status === 204) {
			return json({ message: 'chapter successfully deleted.' });
		}
		if (res?.status === 200) {
			return json({ message: 'chapter successfully deleted.' });
		}
	} catch (error) {
		return json({ error: error.message });
	}
}
