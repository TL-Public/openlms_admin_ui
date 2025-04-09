import { json } from '@sveltejs/kit';

export async function POST({ request, cookies, params }) {
	const authToken = cookies.get('authToken');
	const id = params.rsetiUuid;
	let res;
	try {
		const req = await request.json();

		const res = await fetch(
			`http://read-admin-api-dev.ap-south-1.elasticbeanstalk.com/apis/v1/rsetis/${id}/courses`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${authToken}`
				},
				body: JSON.stringify(req)
			}
		);

		if (!res.ok) {
			throw new Error('Failed to add course to RSETI');
		}

		const responseData = await res.json();
		return json(responseData);
	} catch (error) {
		console.log('Failed to post course data: ', error.message);
		return json(res, { status: res.status });
	}
}

// export async function PUT({ request, cookies, params }) {
// 	const authToken = cookies.get('authToken');
// 	const id = params.rsetiUuid;
// 	try {
// 		const req = await request.json();

// 		const res = await fetch(
// 			`http://read-admin-api-dev.ap-south-1.elasticbeanstalk.com/apis/v1/rsetis/${id}/courses`,
// 			{
// 				method: 'PUT',
// 				headers: {
// 					'Content-Type': 'application/json',
// 					Authorization: `Bearer ${authToken}`
// 				},
// 				body: JSON.stringify(req)
// 			}
// 		);

// 		if (!res.ok) {
// 			throw new Error('Failed to edit course');
// 		}

// 		const responseData = await res.json();
// 		return json(responseData);
// 	} catch (error) {
// 		console.log('Failed to edit course data: ', error.message);
// 	}
// }
