import { BASE_URL } from '$lib/config';
import { fail } from '@sveltejs/kit';
import { getErrorMessage } from '$lib/utils/helper.js';
import { resourceNames, userActions } from '$lib/data.js';


let modifiedFormdata;
let originalFormData;
let id = '';
let courseUuid;
let method = '';

let payLoad;

function preserveFormData() {
	return async ({ request }) => {
		const formData = await request.formData();
		originalFormData = Object.fromEntries(formData.entries());
		id = formData.get('uuid') ? formData.get('uuid') : '';
		courseUuid = formData.get('courseUuid') ? formData.get('courseUuid') : '';
		method = formData.get('method') ? formData.get('method') : '';
		formData.delete('uuid');
		formData.delete('method');
		modifiedFormdata = Object.fromEntries(formData.entries());

		// Build the `translations` array for the payload
		const translations = [
			{
				languageCode: 'en',
				name: formData.get('nameEn'),
				designation: formData.get('designationEn'),
				place: formData.get('placeEn'),
				testimonialText: formData.get('testimonialTextEn')
			},
			{
				languageCode: 'hi',
				name: formData.get('nameHi'),
				designation: formData.get('designationHi'),
				place: formData.get('placeHi'),
				testimonialText: formData.get('testimonialTextHi')
			}
		];

		// Create the final payload object
		payLoad = {
			courseUuid: courseUuid,
			translations
		};
		return {
			data: originalFormData
		};
	};
}

export const actions = {
	review: preserveFormData(),
	final: async ({ cookies }) => {
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
				response = await fetch(`${BASE_URL}/apis/v1/traineetestimonials`, {
					method: 'POST',
					body: dataToSend,
					headers
				});
				if (!response.ok) {
								let { errorMsg } = getErrorMessage({
									status: response?.status,
									action: userActions.ADD,
									module: resourceNames.TRAINEE_TESTIMONIAL
								});
				
								return fail(response.status, {
									error: errorMsg,
									success: false,
									data: originalFormData
								});
							}
			}

			if (method === 'PUT') {
				response = await fetch(`${BASE_URL}/apis/v1/traineetestimonials/${id}`, {
					method: 'PUT',
					body: dataToSend,
					headers
				});

				if (!response.ok) {
								let { errorMsg } = getErrorMessage({
									status: response?.status,
									action: userActions.EDIT,
									module: resourceNames.TRAINEE_TESTIMONIAL
								});
				
								return fail(response.status, {
									error: errorMsg,
									success: false,
									data: originalFormData
								});
							}
			}
			return {
				formSaved: true,
				message: 'Form saved successfully',
				status: response.status,
				data: originalFormData
			};
		} catch (err) {
			console.error('errorr', err);
			return fail(response.status, {
				error: err.message,
				success: false,
				data: originalFormData
			});
		}
	}
};
