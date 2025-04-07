import { BASE_URL } from '$lib/config';
import { fail } from '@sveltejs/kit';

// API not ready yet
let modifiedFormdata;
let originalFormData;
let method = '';
let id = '';

function preserveFormData() {
	return async ({ request }) => {
		const formData = await request.formData();
		originalFormData = Object.fromEntries(formData.entries());
		id = formData.get('uuid') ? formData.get('uuid') : '';
		method = formData.get('method') ? formData.get('method') : '';
		formData.delete('method');
		formData.delete('phoneno1');
		formData.delete('phoneno2');
		formData.delete('email1');
		formData.delete('email2');
		formData.delete('addressLine1');
		formData.delete('addressLine2');
		formData.delete('cityTown');
		formData.delete('pincode');
		formData.delete('state');
		formData.delete('uuid');

		modifiedFormdata = Object.fromEntries(formData.entries());
		return {
			data: originalFormData
		};
	};
}

export const actions = {
	review: preserveFormData(),
	final: async ({ cookies }) => {
		const data = modifiedFormdata;
		const authToken = cookies.get('authToken');
		const headers = {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${authToken}`
		};

		let response;
		try {
			if (method === 'POST') {
				response = await fetch(`${BASE_URL}/apis/v1/nars`, {
					method: 'POST',
					headers: headers,
					body: JSON.stringify(data)
				});
				if (!response.ok || response.status !== 201) {
					throw new Error('Failed to submit form! Please try again');
				}
			}

			if (method === 'PUT') {
				response = await fetch(`${BASE_URL}/apis/v1/nars/${id}`, {
					method: 'PUT',
					headers: headers,
					body: JSON.stringify(data)
				});

				if (!response.ok || response.status !== 200) {
					throw new Error('Failed to submit form! Please try again');
				}
			}

			return { success: true, data: data, status: response?.status };
		} catch (err) {
			console.log('err in NAR form', err);
			return fail(response.status, {
				error: err.message,
				success: false,
				data: originalFormData
			});
		}
	}
};
