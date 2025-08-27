import { json } from '@sveltejs/kit';
import { BASE_URL } from '$lib/config';

export async function GET({ params }) {
    let res
	const { id } = params;
	try {
		 res = await fetch(
			`${BASE_URL}/apis/v1/courses/${id}/course-videos`
		);
		if (!res.ok) {
			throw new Error('Failed to fetch data');
		}

		if (res.status != 200) {
			throw new Error('Failed to fetch data');
		}

		const data = await res.json();
		if (data?.length===0 || Object.keys(data)?.length===0) {
			return json(data,{status:res?.status});
		}

		return json(data,{status:res?.status});
	} catch (error) {
		return json({ error: error.message, status: res.status },{status:res?.status})
}
}

export async function POST({ request, params, cookies }) {
	const { id } = params;
	const authToken = cookies.get('authToken');
	let res;

	try {
		const body = await request.json();

		res = await fetch(`${BASE_URL}/apis/v1/courses/${id}/course-videos`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${authToken}`
			},
			body: JSON.stringify(body)
		});

		if (!res?.ok) {
			return json({ status: res.status, error: 'Failed to add introductory video' }, { status: res.status });
		}

		if (res?.status === 201) {
			const data = await res.json();
			return json(data, { status: res.status });
		}
	} catch (error) {
		return json({ error: error.message, status: res.status }, { status: 500 });
	}
}


export async function DELETE({ params, url, cookies }) {
	let courseUuid = url.searchParams.get('courseUuid');

	let res;
	try {
		const authToken = cookies.get('authToken');

		res = await fetch(`${BASE_URL}/apis/v1/courses/${courseUuid}/course-videos`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${authToken}`
			}
		});

		if (!res.ok) {
			return json({ error: 'Failed to delete introductory videos.' }, { status: res.status });
		}

		// Check for 204 No Content
		if (res?.status === 204 || res?.status === 200) {
			return new Response(null, { status: 204 });
		}
	
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
}
