import { json } from '@sveltejs/kit';
import { BASE_URL } from '$lib/config';

export async function POST({ params, url, request, cookies }) {
	const authToken = cookies.get('authToken');
	let courseUuid = url.searchParams.get('courseUuid');
	let chapterUuid = url.searchParams.get('chapterUuid');
	const body = await request.json();
	console.log('body', JSON.stringify(body))
	let res;
	try {
		res = await fetch(`${BASE_URL}/apis/v1/courses/${courseUuid}/chapters/${chapterUuid}/videos`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${authToken}`
			},
			body: JSON.stringify(body)
		});

		console.log('res', res)

		if (!res?.ok) {
			return json({ status: res.status, error: 'Failed to add video' }, { status: res.status });
		}

		if (res?.status === 201) {
			const responseData = await res.json();
			return json({ responseData, status: res.status }, { status: res.status });
		}
	} catch (error) {
		return json({ error: error.message, status: res.status }, { status: 500 });
	}
}
