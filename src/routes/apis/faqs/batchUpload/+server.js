import { json } from '@sveltejs/kit';
import { BASE_URL } from '$lib/config';

export async function POST({ request, cookies }) {
	const authToken = cookies.get('authToken');
	let res;
	let responseData;

	try {
		const formData = await request.formData();
		res = await fetch(`${BASE_URL}/apis/v1/faqs/bulk-upload`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${authToken}`
			},
			body: formData
		});

		responseData = await res?.json();

		// if (!res.ok || !res?.status === 200) {
		// 	responseData = await res?.text();
		// 	console.log('responseData', responseData)

		// 	throw new Error(responseData || 'Failed to batch update faqs');
		// }

		// responseData = await res?.text();

		// This code needs to be updated when FAQ bulkupload API is corrected Now 200 is the status for all the responses, when that is corrected we can bring in an additional check for status as well
		if(responseData?.errorReportUrl){
			return json(
				{
					error: responseData?.errorMsg || 'Failed to batch update faqs',
					errorReportUrl: responseData?.errorReportUrl
				},
				{ status: res?.status }
				);
		}

		return json(responseData);
	} catch (error) {
		return json({ error: error?.message }, { status: res?.status });
	}
}
