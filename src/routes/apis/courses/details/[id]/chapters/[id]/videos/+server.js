import { json } from '@sveltejs/kit';

export async function POST({ params, url, request, cookies }) {
	const authToken = cookies.get('authToken');
    let courseUuid=url.searchParams.get('courseUuid')
    let chapterUuid=url.searchParams.get('chapterUuid')
	const body = await request.json();
	let res
	try {
		 res = await fetch(
			`http://read-admin-api-dev.ap-south-1.elasticbeanstalk.com/apis/v1/courses/${courseUuid}/chapters/${chapterUuid}/videos`, {
				method: 'POST',
				headers: {
				  'Content-Type': 'application/json',
					Authorization: `Bearer ${authToken}`, 
				},
                body: JSON.stringify(body) 
			  }
		);
		if (!res.ok) {
			throw new Error('Failed to add video');
		}
		if (res.status != 201) {
			throw new Error('Failed to add video');
		}

		const responseData = await res.json();
        return json({responseData,status: res.status} ); 
	} catch (error) {
		return json({ error: error.message, status: res.status });
	}
}
