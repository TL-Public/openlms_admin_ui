let method = '';

async function saveCourseData({ request, fetch, cookies, params }) {
	const authToken = cookies.get('authToken');
    const traineeId = params?.traineeId;
   
	try {
		// Extract form data
		const data = await request.formData();
		const formData = Object.fromEntries(data.entries());
		const body = formData.postData ? JSON.stringify(JSON.parse(formData.postData)) : null;;
		method = data.get('method') || '';
        const rsetiCourseUuid=data.get('uuid') || '';

		let response;
		if (method === 'POST') {
			response = await fetch(`http://read-admin-api-dev.ap-south-1.elasticbeanstalk.com/apis/v1/trainees/${rsetiCourseUuid}`, {
				method: 'POST',
				body: body,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${authToken}`
				}
			});

			if (!response.ok || response.status != 201) {
				if (response.status == 409)
					return {
						error: 'Failed to submit form, trainee already added to the course. ',
						data: body
					};
				return { error: 'Failed to submit form. Please try again.', data: body };
			}
		}

		if (method === 'PUT') {
			response = await fetch(`http://read-admin-api-dev.ap-south-1.elasticbeanstalk.com/apis/v1/trainees/${rsetiCourseUuid}/${traineeId}`, {
				method: 'PUT',
				body: body,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${authToken}`
				}
			});

			// Check for a successful response
			if (!response.ok || response.status != 200) {
				if (response.status == 409)
					return {
						error: 'Failed to submit form, trainee already exists. Please try again.',
						data: body
					};
				return { error: 'Failed to submit form. Please try again.', data: body };
			}
		}

		let resultObject= await response.json()
		// Return success status
		return {
			message: 'Form saved successfully',
			resultObject:resultObject
		};
	} catch (error) {
		console.error('Error in form action for Course:', error.message);
		return {
			error: `Error: ${error.message}`
		};
	}
}

export const actions = {
	final: saveCourseData
};
