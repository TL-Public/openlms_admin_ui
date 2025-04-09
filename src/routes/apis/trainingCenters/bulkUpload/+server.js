import { json } from '@sveltejs/kit';
import { BASE_URL } from '$lib/config';


export async function POST({ request, cookies }) {
	const authToken = cookies.get('authToken');
	let res;
	let responseData;

	try {
		const formData = await request.formData();

		res = await fetch(
			`${BASE_URL}/apis/v1/rsetis/batch-update`,
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${authToken}`
				},
				body: formData
			}
		);

		responseData = await res.json();

		// Check the `count` field to determine success or failure
		if (responseData?.count === 0) {
		// If failure, return the error message and file URL to the component
		return json(
		{
			error: responseData.errorMsg,
			errorReportUrl: responseData.errorFileUrl
		},
		{ status: res?.status }
		);
	}


		// If successful, return the response data
		return json(responseData);
	} catch (error) {
		// Return error with an appropriate status code and message
		return json({ error: error.message }, { status: res?.status });
	}
}

