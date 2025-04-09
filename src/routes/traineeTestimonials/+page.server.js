import { reapUrls, urlPath } from '$config/constants';
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
			// Add token if required for authentication

			Authorization: `Bearer ${authToken}`
		};
		if (method === 'POST') {
			const response = await fetch(
				`${reapUrls.adminTestURL}${urlPath.testPath}/v1/traineetestimonials`,
				{
					method: 'POST',
					body: dataToSend,
					headers
				}
			);
			if (!response.ok || !response.status == 201) {
				return { error: 'Failed to submit form. Please try again!', data: originalFormData };
			}
		}

		if (method === 'PUT') {
			const response = await fetch(
				`${reapUrls.adminTestURL}${urlPath.testPath}/v1/traineetestimonials/${id}`,
				{
					method: 'PUT',
					body: dataToSend,
					headers
				}
			);

			if (!response.ok || !response.status == 200) {
				return { error: 'Failed to submit form. Please try again!', data: originalFormData };
			}
		}

		return { success: true, data: data };
	}
};
