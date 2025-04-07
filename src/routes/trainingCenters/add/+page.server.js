import { fail } from '@sveltejs/kit';
import { getErrorMessage } from '$lib/utils/helper.js';
import { resourceNames, userActions } from '$lib/data.js';

let originalFormData = {};
let method = '';

async function preserveFormData({ request, fetch }) {
	const formData = await request.formData();
	originalFormData = Object.fromEntries(formData.entries());
	// originalFormData = JSON.parse(originalFormData.data);
	method = formData.get('method') || '';

	// TODO handle creating form response and passing it back
	return { saved: true, data: originalFormData };
}

async function saveFormData({ fetch }) {
	let response;

	try {
		if (method === 'POST') {
			response = await fetch('/apis/trainingCenters', {
				method: 'POST',
				body: JSON.stringify(originalFormData),
				headers: {
					'content-type': 'application/json'
				}
			});

			if (!response.ok) {
				let { errorMsg } = getErrorMessage({
					status: response?.status,
					action: userActions.ADD,
					module: resourceNames.TRAINING_CENTER
				});

				return fail(response.status, {
					error: errorMsg,
					success: false,
					data: originalFormData
				});
			}
		}
		if (method === 'PUT') {
			response = await fetch(`/apis/trainingCenters/${originalFormData.uuid}`, {
				method: 'PUT',
				body: JSON.stringify(originalFormData),
				headers: {
					'content-type': 'application/json'
				}
			});

			if (!response.ok) {
				let { errorMsg } = getErrorMessage({
					status: response?.status,
					action: userActions.EDIT,
					module: resourceNames.TRAINING_CENTER
				});

				return fail(response.status, {
					error: errorMsg,
					success: false,
					data: originalFormData
				});
			}
		}

		// const respData = await response.json();

		// if (respData.error) {
		// 	return {
		// 		formSaved: true,
		// 		error: respData.error
		// 	};
		// }

		return {
			formSaved: true,
			message: 'Form saved successfully',
			status: response.status,
			data: originalFormData
		};
	} catch (err) {
		return fail(response.status, {
			error: err.message,
			success: false,
			data: originalFormData
		});
	}
}
export const actions = {
	review: preserveFormData,
	final: saveFormData
};
