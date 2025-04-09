import { BASE_URL } from '$lib/config';
import { fail } from '@sveltejs/kit';
import { getErrorMessage } from '$lib/utils/helper.js';
import { resourceNames, userActions } from '$lib/data.js';

let method = '';

async function saveCourseData({ request, fetch, cookies }) {
	const authToken = cookies.get('authToken');
	let response;
	const data = await request.formData();
	const formData = Object.fromEntries(data.entries());
	method = data.get('method') || '';
	let body = formData.postData ? JSON.stringify(JSON.parse(formData.postData)) : null;

	try {
		if (method === 'POST') {
			response = await fetch(`${BASE_URL}/apis/v1/rsetis/${formData.rsetiUuid}/courses`, {
				method: 'POST',
				body: body,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${authToken}`
				}
			});

			if (!response.ok) {
				let { errorMsg } = getErrorMessage({
					status: response?.status,
					action: userActions.ADD,
					module: resourceNames.TRAINING_CENTER_COURSE
				});

				return fail(response.status, {
					error: errorMsg,
					success: false,
					data: JSON.parse(formData.postData)
				});
			}
		}

		if (method === 'PUT') {
			response = await fetch(
				`${BASE_URL}/apis/v1/rsetis/${formData.rsetiUuid}/rseticourses/${formData.uuid}`,
				{
					method: 'PUT',
					body: body,
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${authToken}`
					}
				}
			);

			if (!response.ok) {
				let { errorMsg } = getErrorMessage({
					status: response?.status,
					action: userActions.EDIT,
					module: resourceNames.TRAINING_CENTER_COURSE
				});

				return fail(response.status, {
					error: errorMsg,
					success: false,
					data: JSON.parse(formData.postData)
				});
			}
		}

		let resultObject = await response.json();
		// Return success status

		return {
			status: response.status,
			resultObject
		};
	} catch (error) {
		console.error('Error in form action for Course:', error.message);

		return fail(response.status, {
			error: error.message,
			success: false,
			resultObject: body
		});
	}
}

export const actions = {
	final: saveCourseData
};
