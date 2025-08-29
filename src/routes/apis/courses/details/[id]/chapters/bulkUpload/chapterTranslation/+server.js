import { json } from '@sveltejs/kit';
import { BASE_URL } from '$lib/config';

export async function POST({ request, cookies }) {
	const authToken = cookies.get('authToken');
	let res;
	let responseData;

	try {
		const formData = await request.formData();

		res = await fetch(`${BASE_URL}/apis/v1/courses/batch-update/chapters`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${authToken}`
			},
			body: formData
		});

		if (!res.ok || !res?.status === 200) {
			responseData = await res?.text();
			throw new Error(responseData || 'Failed to batch update courses');
		}

		responseData = await res?.text();
		return json(responseData, { status: res?.status });
	} catch (error) {
		return json({ error: error?.message }, { status: res?.status });
	}
}
