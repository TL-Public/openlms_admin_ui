import { json } from '@sveltejs/kit';

export async function DELETE({ params, cookies }) {
	const { id } = params;
	const authToken = cookies.get('authToken');
	try {
		const res = await fetch(
			`http://read-admin-api-dev.ap-south-1.elasticbeanstalk.com/apis/v1/courses/${id}`,
			{
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${authToken}`
				}
			}
		);
		if (!res.ok) {
			return json({ error: 'Failed to delete the course.' });
		}
		if (res?.status === 404) {
			return json({ error: 'Data Not Found!' });
		}

		// Check for 204 No Content
		if (res?.status === 204) {
			return json({ message: 'Course successfully deleted.' });
		}
	} catch (error) {
		return json({ error: error.message });
	}
}
