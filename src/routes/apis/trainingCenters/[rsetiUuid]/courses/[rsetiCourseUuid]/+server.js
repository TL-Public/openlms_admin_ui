import { json } from '@sveltejs/kit';

export async function PUT({ request, cookies, params }) {
	const authToken = cookies.get('authToken');

	try {
		const req = await request.json();

		const res = await fetch(
			`http://read-admin-api-dev.ap-south-1.elasticbeanstalk.com/apis/v1/rsetis/${params.rsetiUuid}/rseticourses/${params.rsetiCourseUuid}`,
			{
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${authToken}`
				},
				body: JSON.stringify(req)
			}
		);

		if (!res.ok) {
			throw new Error('Failed to edit course');
		}

		const responseData = await res.json();
		return json(responseData);
	} catch (error) {
		console.log('Failed to edit course data: ', error.message);
	}
}

export async function DELETE({ cookies, params, url }) {
	const authToken = cookies.get('authToken');

	let res;
	try {
		console.log(
			`http://read-admin-api-dev.ap-south-1.elasticbeanstalk.com/apis/v1/rsetis/${params.rsetiUuid}/rseticourses/${params.rsetiCourseUuid}`
		);
		console.log('reached DELETE');
		res = await fetch(
			`http://read-admin-api-dev.ap-south-1.elasticbeanstalk.com/apis/v1/rsetis/${params.rsetiUuid}/rseticourses/${params.rsetiCourseUuid}`,
			{
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${authToken}`
				}
			}
		);
		console.log('res', res.status);
		if (!res.ok) {
			throw new Error('Failed to delete course');
		}

		return json(res);
	} catch (error) {
		console.log('Failed to delete course: ', error.message);
		return json(error, { status: res.status });
	}
}
