import { json } from '@sveltejs/kit';
import { BASE_URL } from '$lib/config';

export async function DELETE({ params, url, cookies }) {
	const authToken = cookies.get('authToken');
	let courseUuid = url.searchParams.get('courseUuid');
	let chapterUuid = url.searchParams.get('chapterUuid');
	let videoUuid = url.searchParams.get('videoUuid');
	let res;
	try {
		res = await fetch(
			`${BASE_URL}/apis/v1/courses/${courseUuid}/chapters/${chapterUuid}/videos/${videoUuid}`,
			{
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${authToken}`
				}
			}
		);

		if (!res.ok) {
			return json({ error: 'Failed to delete video.' }, { status: res.status });
		}

		// Check for 204 No Content
		if (res?.status === 204) {
			return new Response(null, { status: 204 });
		}

		if (res?.status === 200) {
			return json({ message: 'video successfully deleted.' }, { status: res.status });
		}
	} catch (error) {
		return json({ error: error.message, status: res.status }, { status: 500 });
	}
}
