import { json } from '@sveltejs/kit';
import { BASE_URL } from '$lib/config';

// export async function PUT({ request, params, url, cookies }) {
// 	let courseUuid = url.searchParams.get('courseUuid');
// 	let videoUuid = url.searchParams.get('videoUuid');

// 	let res;
// 	try {
// 		const authToken = cookies.get('authToken');
// 		const body = await request.json();
// 		res = await fetch(`${BASE_URL}/apis/v1/courses/${courseUuid}/course-videos/${videoUuid}`, {
// 			method: 'PUT',
// 			headers: {
// 				'Content-Type': 'application/json',
// 				Authorization: `Bearer ${authToken}`
// 			},
// 			body: JSON.stringify(body)
// 		});

// 		console.log('res', res)

// 		if (!res?.ok) {
// 			return json({ status: res.status, error: 'Failed to edit intro video' }, { status: res.status });
// 		}

// 		if (res?.status === 200) {
// 			const data = await res.json();
// 			return json(data);
// 		}
// 	} catch (error) {
// 		return json({ error: error.message, status: res.status }, { status: 500 });
// 	}
// }

export async function DELETE({ params, url, cookies }) {
	let courseUuid = url.searchParams.get('courseUuid');
	let videoUuid = url.searchParams.get('videoUuid');

	let res;
	try {
		const authToken = cookies.get('authToken');

		res = await fetch(`${BASE_URL}/apis/v1/courses/${courseUuid}/course-videos/${videoUuid}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${authToken}`
			}
		});

		if (!res.ok) {
			return json({ error: 'Failed to delete introductory video.' }, { status: res.status });
		}

		// Check for 204 No Content
		if (res?.status === 204 || res?.status === 200) {
			return new Response(null, { status: 204 });
		}
	
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
}
