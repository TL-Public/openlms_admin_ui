import { json } from '@sveltejs/kit';

export async function DELETE({ params, cookies }) {
	const { id } = params;
	const authToken = cookies.get('authToken');
    let res
	try {
		 res = await fetch(
			`http://read-admin-api-dev.ap-south-1.elasticbeanstalk.com/apis/v1/faqcategories/${id}`,
			{
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${authToken}`
				}
			}
		);
		if (!res.ok) {
			return json({ error: 'Failed to delete the faq category.' },{status:res.status});
		}
		if (res?.status === 404) {
			return json({ error: 'Data Not Found' },{status:res.status});
		}

		// Check for 204 No Content
		if (res?.status === 204) {
			return json({ message: 'FAQ category successfully deleted.' });
		}
	} catch (error) {
		return json({ error: error.message },{status:res.status});
	}
}