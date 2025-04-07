import { json } from '@sveltejs/kit';
import { BASE_URL } from '$lib/config';

export async function GET({ params, cookies }) {
	const { stateId } = params;
	let res;
	const authToken = cookies.get('authToken');
	try {
		res = await fetch(
			`${BASE_URL}/apis/v1/states/${stateId}`,
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
		return json({ status: res.status, error: error.message });
	}
}

// export async function PUT({ request, params, url, cookies }) {
// 	const { id } = params;
// 	let res;
// 	try {
// 		const authToken = cookies.get('authToken');
// 		const body = await request.json();
// 		res = await fetch(
// 			`${BASE_URL}/apis/v1/courses/${id}`,
// 			{
// 				method: 'PUT',
// 				headers: {
// 					'Content-Type': 'application/json',
// 					Authorization: `Bearer ${authToken}`
// 				},
// 				body: JSON.stringify(body)
// 			}
// 		);
// 		if (!res.ok) {
// 			throw new Error('Failed to edit chapter');
// 		}
// 		const responseData = await res.json();
// 		return json(responseData);
// 	} catch (error) {
// 		return json({ status: res.status, error: error.message });
// 	}
// }
