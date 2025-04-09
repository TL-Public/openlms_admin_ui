import { BASE_URL } from '$lib/config';
import { fail } from '@sveltejs/kit';
import { getErrorMessage } from '$lib/utils/helper.js';
import { resourceNames, userActions } from '$lib/data.js';

let method = '';

async function saveCourseData({ request, fetch, cookies, params }) {
	const authToken = cookies.get('authToken');
	const traineeId = params?.traineeId;
	const data = await request?.formData();
	const formData = Object.fromEntries(data.entries());
	let response;
	try {
		// Extract form data
		const body = formData.postData ? JSON.stringify(JSON.parse(formData.postData)) : null;

		method = data.get('method') || '';
		const rsetiCourseUuid = data.get('uuid') || '';

		if (method === 'POST') {
			response = await fetch(`${BASE_URL}/apis/v1/trainees/${rsetiCourseUuid}`, {
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
					module: resourceNames.TRAINEE_COURSE
				});

				return fail(response.status, {
					error: errorMsg,
					success: false,
					data: JSON.parse(formData.postData)
				});
			}
		}

		if (method === 'PUT') {
			response = await fetch(`${BASE_URL}/apis/v1/trainees/${rsetiCourseUuid}/${traineeId}`, {
				method: 'PUT',
				body: body,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${authToken}`
				}
			});

			if (!response.ok) {
				let { errorMsg } = getErrorMessage({
					status: response?.status,
					action: userActions.EDIT,
					module: resourceNames.TRAINEE_COURSE
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
			message: 'Form saved successfully',
			resultObject: resultObject
		};
	} catch (error) {
		console.error('Error in form action for Course:', error.message);
		return fail(response.status, {
			error: error.message,
			success: false,
			data: JSON.parse(formData.postData)
		});
	}
}

export const actions = {
	final: saveCourseData
};
