import { BASE_URL } from '$lib/config';
import { fail } from '@sveltejs/kit';
import { getErrorMessage } from '$lib/utils/helper.js';
import { resourceNames, userActions } from '$lib/data.js';

let modifiedFormdata;
let originalFormData;
let id = '';
let method = '';
let image;
let imageUrl = '';
let payLoad;
let videoUrl;
let type;

function preserveFormData() {
	return async ({ request }) => {
		const formData = await request.formData();
		const imageData = formData.getAll('image');
		image = imageData[0];
		imageUrl = formData.get('imageUrl');

		formData.delete('image');
		formData.delete('imageUrl');
		originalFormData = Object.fromEntries(formData.entries());
		id = formData.get('uuid') ? formData.get('uuid') : '';
		method = formData.get('method') ? formData.get('method') : '';
		videoUrl = formData.get('videoUrl') ? formData.get('videoUrl') : '';
		type = formData.get('type') ? formData.get('type') : '';
		formData.delete('uuid');
		formData.delete('method');
		formData.delete('type');
		formData.delete('videoUrl');
		modifiedFormdata = Object.fromEntries(formData.entries());

		// Build the `translations` array for the payload
		const translations = [
			{
				languageCode: 'en',
				name: formData.get('nameEn'),
				designation: formData.get('designationEn'),
				testimonialText: formData.get('testimonialTextEn')
			},
			{
				languageCode: 'hi',
				name: formData.get('nameHi'),
				designation: formData.get('designationHi'),
				testimonialText: formData.get('testimonialTextHi')
			}
		];

		// Create the final payload object
		if (method === 'POST') {
			if (type === 'text') {
				payLoad = {
					translations
				};
			}
			if (type === 'video')
				payLoad = {
					videoUrl: videoUrl,
					translations
				};
		}
		if (method === 'PUT') {
			if (type === 'text') {
				payLoad = {
					image: imageUrl ? imageUrl : null,
					translations
				};
			}
			if (type === 'video') {
				payLoad = {
					videoUrl: videoUrl,
					image: imageUrl ? imageUrl : null,
					translations
				};
			}
		}

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

		const headersForImageUpload = {
			Authorization: `Bearer ${authToken}`
		};

		let response;
		try {
			if (method === 'POST') {
				response = await fetch(`${BASE_URL}/apis/v1/testimonials`, {
					method: 'POST',
					body: dataToSend,
					headers
				});

				if (!response.ok) {
					let { errorMsg } = getErrorMessage({
						status: response?.status,
						action: userActions.ADD,
						module: resourceNames.OFFICIAL_TESTIMONIAL
					});

					return fail(response.status, {
						error: errorMsg,
						success: false,
						data: originalFormData
					});
				}
			} else if (method === 'PUT') {
				response = await fetch(`${BASE_URL}/apis/v1/testimonials/${id}`, {
					method: 'PUT',
					body: dataToSend,
					headers
				});

				if (!response.ok) {
					let { errorMsg } = getErrorMessage({
						status: response?.status,
						action: userActions.EDIT,
						module: resourceNames.OFFICIAL_TESTIMONIAL
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

				const responseForImage = await fetch(
					`${BASE_URL}/apis/v1/testimonials/${result.uuid}/image`,
					{
						method: 'POST',
						body: formDataForImage,
						headers: headersForImageUpload
					}
				);

				if (!responseForImage?.ok) {
					throw new Error(
						`Successfully updated official testimonial details but failed to update image. Please try again! Status: ${responseForImage.status}`
					);
				}
			}

			return { success: true, data: result };
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
