import { redirect, fail } from '@sveltejs/kit';
import { BASE_URL } from '$lib/config';
import { getErrorMessage } from '$lib/utils/helper.js';
import { resourceNames, userActions } from '$lib/data.js';

let modifiedFormdata;
let originalFormData;
let id = '';
let method = '';
let image;
let payLoad;

function preserveFormData() {
	return async ({ request }) => {
		const formData = await request.formData();
		const imageData = formData.getAll('image');
		image = imageData[0];
		formData.delete('image');
		originalFormData = Object.fromEntries(formData.entries());
		id = formData.get('uuid') || '';
		method = formData.get('method') || '';
		formData.delete('uuid');
		formData.delete('method');
		modifiedFormdata = Object.fromEntries(formData.entries());

		// Construct translations
		const englishTranslation = {
			languageCode: 'en',
			title: formData.get('titleEn'),
			description: formData.get('descriptionEn'),
			aboutVideoUrl: formData.get('urlEn')
		};

		let hindiTranslation = {
			languageCode: 'hi',
			title: formData.get('titleHi'),
			description: formData.get('descriptionHi'),
			aboutVideoUrl: formData.get('urlHi')
		};

		// Create the translations array
		const translations = [englishTranslation];

		if (method == 'POST') {
			// Remove empty fields from Hindi translation
			for (const key in hindiTranslation) {
				if (hindiTranslation[key] === '' && key !== 'languageCode') {
					delete hindiTranslation[key];
				}
			}

			// Check if only languageCode remains, and remove the Hindi object entirely
			if (Object.keys(hindiTranslation).length === 1) {
				hindiTranslation = null;
			}
			if (hindiTranslation) {
				translations.push(hindiTranslation);
			}
		}

		if (method == 'PUT') {
			translations.push(hindiTranslation);
		}

		payLoad = {
			courseCode: formData.get('courseCode'),
			displayCourseCode: formData.get('displayCourseCode'),
			duration: formData.get('duration'),
			category: formData.get('category'),
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

		const headersForImageUpload = {
			Authorization: `Bearer ${authToken}`
		};

		let response;
		try {
			if (method === 'POST') {
				response = await fetch(`${BASE_URL}/apis/v1/courses`, {
					method: 'POST',
					body: dataToSend,
					headers
				});

				if (!response.ok) {
					let { errorMsg } = getErrorMessage({
						status: response?.status,
						action: userActions.ADD,
						module: resourceNames.COURSE
					});

					if (response.status == 409) {
						let responseBody = await response.text();
						errorMsg = responseBody;
					}

					return fail(response.status, {
						error: errorMsg,
						success: false,
						data: originalFormData
					});
				}
			} else if (method === 'PUT') {
				response = await fetch(`${BASE_URL}/apis/v1/courses/${id}`, {
					method: 'PUT',
					body: dataToSend,
					headers
				});

				if (!response.ok) {
					const { errorMsg } = getErrorMessage({
						status: response?.status,
						action: userActions.EDIT,
						module: resourceNames.COURSE
					});

					return fail(response.status, {
						error: errorMsg,
						success: false,
						data: originalFormData
					});
				}
			} else {
				throw new Error('Invalid method');
			}

			const result = await response.json();

			// Check if image is a File and exists before attempting to upload
			if (image instanceof File && image.size > 0) {
				const formDataForImage = new FormData();
				formDataForImage.append('file', image, image.name);

				const responseForImage = await fetch(`${BASE_URL}/apis/v1/courses/${result.uuid}/image`, {
					method: 'POST',
					body: formDataForImage,
					headers: headersForImageUpload
				});

				if (!responseForImage?.ok) {
					// cases where customsied error messages are required (like here) is handled on case to case basis
					if (response.status == 401) {
						return fail(responseForImage.status, {
							error: 'Your session has expired',
							success: false,
							data: originalFormData
						});
					}

					const errMsg = `Successfully ${method?.toLowerCase() === 'post' ? 'added' : 'edited'} course details but failed to ${method?.toLowerCase() === 'post' ? 'add' : 'edit'} image. Please try again. Status: ${responseForImage.status}`;
					return fail(responseForImage.status, {
						error: errMsg,
						success: false,
						data: originalFormData
					});
				}
			}

			return { success: true, data: result, status: response?.status };
		} catch (err) {
			console.error(err);

			return fail(response.status, {
				error: err.message,
				success: false,
				data: originalFormData
			});
		}
	}
};
