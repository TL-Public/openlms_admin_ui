import { json } from '@sveltejs/kit';
import { BASE_URL } from '$lib/config';

export async function GET({ params }) {
	const { id } = params;
	try {
		const res = await fetch(
			`${BASE_URL}/reap/api/v1/courses/${id}/videos`
		);
		if (!res.ok) {
			throw new Error('Failed to fetch data');
		}

		if (res.status != 200) {
			throw new Error('Failed to fetch data');
		}

		const data = await res.json();
		if (data?.length===0 || Object.keys(data)?.length===0) {
			throw new Error('Data not found');
		}

		return json(data);
	} catch (error) {
		return json([])
}
}