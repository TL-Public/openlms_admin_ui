import { BASE_URL } from '$lib/config';
import { redirect, fail } from '@sveltejs/kit';
import { getErrorMessage } from '$lib/utils/helper.js';
import { resourceNames, userActions } from '$lib/data.js';

let modifiedFormdata;
let originalFormData;
let id = '';
let method = '';

let payLoad;

function preserveFormData() {
	return async ({ request }) => {
		const formData = await request.formData();
		originalFormData = Object.fromEntries(formData.entries());
		id = formData.get('uuid') ? formData.get('uuid') : '';
		method = formData.get('method') ? formData.get('method') : '';
		// formData.delete('uuid');
		formData.delete('method');
		modifiedFormdata = Object.fromEntries(formData.entries());

		// Build the `translations` array for the payload
		const translations = [
			{
				languageCode: 'en',
				question: formData.get('questionEn'),
				answer: formData.get('answerEn')
			},
			{
				languageCode: 'hi',
				question: formData.get('questionHi'),
				answer: formData.get('answerHi')
			}
		];

		// Create the final payload object
		payLoad = {
			categoryId: formData.get('categoryId'),
			translations
		};
		return {
			data: originalFormData
		};
	};
}

export const actions = {
	review: preserveFormData(),
	final: async ({ cookies, url }) => {
		const data = payLoad;
		const authToken = cookies.get('authToken');

		const dataToSend = JSON.stringify(data);
		const headers = {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${authToken}`
		};
		let response;
		try {
			if (method === 'POST') {
				response = await fetch(`${BASE_URL}/apis/v1/faqs`, {
					method: 'POST',
					body: dataToSend,
					headers
				});

				if (!response.ok) {
					const { errorMsg } = getErrorMessage({
						status: response?.status,
						action: userActions.ADD,
						module: resourceNames.FAQ
					});

					return fail(response.status, {
						error: errorMsg,
						success: false,
						data: originalFormData
					});
				}
			}

			if (method === 'PUT') {
				response = await fetch(`${BASE_URL}/apis/v1/faqs/${id}`, {
					method: 'PUT',
					body: dataToSend,
					headers
				});

				if (!response.ok) {
					const { errorMsg } = getErrorMessage({
						status: response?.status,
						action: userActions.EDIT,
						module: resourceNames.FAQ
					});

					return fail(response.status, {
						error: errorMsg,
						success: false,
						data: originalFormData
					});
				}
			}

			return { success: true, data: data };
		} catch (err) {
			console.log('error', err.message, 'response.status', response.status);

			return fail(response.status, {
				error: err.message,
				success: false,
				data: originalFormData
			});
		}
	}
};
