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
				'http://read-admin-api-dev.ap-south-1.elasticbeanstalk.com/apis/v1/faqs',
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
				`http://read-admin-api-dev.ap-south-1.elasticbeanstalk.com/apis/v1/faqs/${id}`,
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
