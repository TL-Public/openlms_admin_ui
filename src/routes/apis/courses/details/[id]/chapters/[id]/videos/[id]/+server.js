import { json } from '@sveltejs/kit';


export async function DELETE({ params, url, cookies }) {
	const authToken = cookies.get('authToken');
	let courseUuid=url.searchParams.get('courseUuid')
    let chapterUuid=url.searchParams.get('chapterUuid')
    let videoUuid=url.searchParams.get('videoUuid')
	let res
	try {
		 res = await fetch(
                `http://read-admin-api-dev.ap-south-1.elasticbeanstalk.com/apis/v1/courses/${courseUuid}/chapters/${chapterUuid}/videos/${videoUuid}`,
			{
				method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
					Authorization: `Bearer ${authToken}`
                },
			}
		);
		if (!res.ok) {
		  return json({ error: 'Failed to delete video.' });
		}
		if (res?.status === 404) {
			return json({ error: 'Data Not Found!'});
		  }
	  
		  // Check for 204 No Content
		  if (res?.status === 204) {
				return json({ message: 'video successfully deleted.' });
		  }
		  if (res?.status === 200) {
				return json({ message: 'video successfully deleted.' });
		  }
	} catch (error) {
		return json({ error: error.message, status: res.status });
	}
}
