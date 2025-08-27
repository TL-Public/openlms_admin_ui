import { json } from '@sveltejs/kit';
import { BASE_URL } from '$lib/config';

export async function GET({ params, cookies }) {
	const { id } = params;
	const authToken = cookies.get('authToken');
	
	try {
		const response = await fetch(
			`${BASE_URL}/apis/v1/batch/status/uuid/${id}`,
			{
				method: 'GET',
				headers: {
					Authorization: `Bearer ${authToken}`
				}
			}
		);
		
		if (!response.ok) {
			throw new Error('Failed to fetch job status');
		}
		
		const data = await response.json();
		return json(data,{status:response?.status});
	} catch (error) {
		console.error('Error fetching job status:', error);
		return json({ error: error.message }, { status: 500 });
	}
}