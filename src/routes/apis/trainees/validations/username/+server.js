import { json } from '@sveltejs/kit';
import { BASE_URL } from '$lib/config';

export async function GET({ request, fetch, cookies }) {
	const authToken = cookies.get('authToken');
	let res;

	try {
		// Extract username from query parameters
		const queryParams = new URL(request.url).searchParams;
		const username = queryParams.get('username');

		if (!username) {
			return json({ status: 400, error: 'Username is required' },{ status: res.status });
		}

		const endPoint = `${BASE_URL}/apis/v1/trainees/usernames/${username}`;
		 res = await fetch(endPoint, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${authToken}`
			}
		});

		// Handle both 200 (username unavailable) and 404 (username available)
		if (res.status === 200) {
			const data = await res.json();
			return json({ status: 200, message: 'Email unavailable', traineeDetails:data },{ status: res.status }); // Return the existing user data
		} else if (res.status === 404) {
			const errorData = await res.json();
			if (errorData.errorCode === 'TRAINEE_NOT_FOUND') {
				return json({ status: 404, message: errorData.error },{ status: res.status });
			} else {
				throw new Error('Unexpected error response');
			}
		}

		// Handle other non-200 responses
		throw new Error(`Unexpected response: ${res.status}`);
	} catch (error) {

		return json({ status: res.status, error: error.message },{ status: res.status });

	}
}




