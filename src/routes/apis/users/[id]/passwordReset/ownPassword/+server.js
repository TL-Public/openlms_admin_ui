import { json } from '@sveltejs/kit';
import { BASE_URL } from '$lib/config';

export async function POST({ request, fetch, cookies, params }) {

	let res;
	const authToken = cookies.get('authToken');
	try {
        
		const parsedData = await request.json();
 
		let queryparams = request.url.split('?');
		let endPoint = `${BASE_URL}/apis/v1/users/reset-password`;
		if (queryparams?.length > 1) {
			endPoint += '?' + queryparams[1];
		}
		res = await fetch(endPoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${authToken}`
			},
			body: JSON.stringify(parsedData)
		});

		let responseData = null;

		try {
			responseData = await res?.json();
		} catch (jsonError) {
			try {
				// If JSON parsing fails
				responseData = await res?.text();
			} catch (textError) {
				// If both JSON & text parsing fail
				responseData = 'Failed to reset password';
			}
		}

		if(res?.status === 400){
			throw new Error( responseData?.error || responseData || 'Failed to reset password');
		}

		if (!res.ok) {
			throw new Error(responseData?.error || responseData || 'Failed to reset password');
		}

		if (res.status != 200) {
			throw new Error(responseData?.error || responseData || 'Failed to reset password');
		}



		// if (data?.length === 0 || Object.keys(data)?.length === 0) {
		// 	throw new Error('Data not found');
		// }
		return json({ message: 'Password reset successfully' }, { status: res?.status });
	} catch (error) {
		return json({ status: res?.status, error: error?.message }, { status: res?.status });
	}
}
