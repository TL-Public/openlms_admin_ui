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

		// const translations = [
		// 	{
		// 		languageCode: 'en',
		// 		title: formData.get('titleEn'),
		// 		description: formData.get('descriptionEn'),
		// 		aboutVideoUrl: formData.get('urlEn'),
		// 	},
		// 	{
		// 		languageCode: 'hi',
		// 		title: formData.get('titleHi'),
		// 		description: formData.get('descriptionHi'),
		// 		aboutVideoUrl: formData.get('urlHi'),
		// 	},
		// ];

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
				response = await fetch(
					'http://read-admin-api-dev.ap-south-1.elasticbeanstalk.com/apis/v1/courses',
					{
						method: 'POST',
						body: dataToSend,
						headers
					}
				);
				if (!response.ok || !response.status == 201) {
					if (response.status == 409) {
						let responseBody = await response.text();
						return {
							error: `Failed to submit form. ${responseBody}. Status: ${response.status}`,
							data: originalFormData
						};
					}
					if (response.status == 404) {
						let responseBody = await response.json();
						return {
							error: `Failed to submit form. ${responseBody.error}. Error Code: ${responseBody.errorCode} `,
							data: originalFormData
						};
					}
					return {
						error: `Failed to submit form. Please try again. Status: ${response.status} `,
						data: originalFormData
					};
				}
			} else if (method === 'PUT') {

				response = await fetch(
					`http://read-admin-api-dev.ap-south-1.elasticbeanstalk.com/apis/v1/courses/${id}`,
					{
						method: 'PUT',
						body: dataToSend,
						headers
					}
				);
				if (!response.ok || !response.status == 200) {
					return {
						error: `Failed to submit form. Please try again. Status: ${response.status}`,
						data: originalFormData
					};
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
					`http://read-admin-api-dev.ap-south-1.elasticbeanstalk.com/apis/v1/courses/${result.uuid}/image`,
					{
						method: 'POST',
						body: formDataForImage,
						headers: headersForImageUpload
					}
				);

				if (!responseForImage?.ok) {
					return {
						error: `Successfully ${method?.toLowerCase() === 'post' ? 'added' : 'edited'} course details but failed to ${method?.toLowerCase() === 'post' ? 'add' : 'edit'} image. Please try again. Status: ${responseForImage.status}`,
						data: originalFormData
					};
				}
			}

			return { success: true, data: result, status: response?.status };
		} catch (err) {
			console.error(err);
			return {
				error: `Failed to submit form. Please try again. Status: ${response.status}`,
				data: originalFormData,
				status: response?.status
			};
		}
	}
};
