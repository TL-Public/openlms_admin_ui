import { json } from '@sveltejs/kit';
import { BASE_URL } from '$lib/config';

export async function DELETE({ params, cookies, url }) {
	const { id } = params;
	const authToken = cookies.get('authToken');
	let disassociateAboutVideo = url.searchParams.get('disassociateAboutVideo')
	let res;
	try {
		res = await fetch(`${BASE_URL}/apis/v1/courses/${id}/chapters?disassociateAboutVideo=${disassociateAboutVideo}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${authToken}`
			}
		});

		console.log('res', res)
		
		if (!res.ok) {
			return json({ error: 'Failed to delete the chapters.' }, { status: res.status });
		}

		// Check for 204 No Content
		if (res?.status === 204 || res?.status === 200) {
			return new Response(null, { status: 204 });
		}
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
}
