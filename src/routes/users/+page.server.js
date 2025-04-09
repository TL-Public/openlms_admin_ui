import { BASE_URL } from '$lib/config';
import { fail, redirect } from '@sveltejs/kit';
import { getErrorMessage } from '$lib/utils/helper.js';
import { resourceNames, userActions } from '$lib/data.js';

let originalFormData;
let image;
let payLoad;
let method = '';

function replaceNull(value) {
	// Convert 'null' string or empty values to null
	return value === 'null' || value === '' ? null : value;
}
async function preserveFormData({ request }) {
	const formData = await request.formData();
	const imageData = formData.getAll('image');
	image = imageData[0];
	formData.delete('image');
	originalFormData = Object.fromEntries(formData.entries());
	method = formData.get('method') || '';
	formData.delete('method');

	payLoad = {
		username: replaceNull(originalFormData.username),
		uuid: replaceNull(originalFormData.uuid),
		name: replaceNull(originalFormData.name),
		designation: replaceNull(originalFormData.designation),
		email: replaceNull(originalFormData.email),
		contactNumber: replaceNull(originalFormData.contactNumber),
		roleId: replaceNull(originalFormData.roleId),
		rsetiId: replaceNull(originalFormData.rsetiId),
		stateId: replaceNull(originalFormData.stateId),
		currentAddr: originalFormData.currentAddressSameAsPermanent
			? originalFormData.permanentAddr
			: originalFormData.currentAddr,
		permanentAddr: replaceNull(originalFormData.permanentAddr),

		status: replaceNull(originalFormData.status)
	};

	return { saved: true, formData: originalFormData };
}

async function saveFormData({ request, cookies, url }) {
	{
		const data = payLoad;
		const uuid = payLoad.uuid;

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
				response = await fetch(`${BASE_URL}/apis/v1/users`, {
					method: 'POST',
					body: dataToSend,
					headers
				});

				if (!response.ok) {
					let { errorMsg } = getErrorMessage({
						status: response?.status,
						action: userActions.ADD,
						module: resourceNames.USERS
					});

					return fail(response.status, {
						error: errorMsg,
						success: false,
						data: originalFormData
					});
				}
			} else if (method === 'PUT') {
				response = await fetch(`${BASE_URL}/apis/v1/users/${uuid}`, {
					method: 'PUT',
					body: dataToSend,
					headers
				});

				if (!response.ok) {
					let { errorMsg } = getErrorMessage({
						status: response?.status,
						action: userActions.EDIT,
						module: resourceNames.USERS
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

				const responseForImage = await fetch(`${BASE_URL}/apis/v1/users/${result.uuid}/image`, {
					method: 'POST',
					body: formDataForImage,
					headers: headersForImageUpload
				});

				if (!responseForImage?.ok) {
					throw new Error(
						`Successfully ${method?.toLowerCase() === 'post' ? 'added' : 'edited'} user details but failed to ${method?.toLowerCase() === 'post' ? 'add' : 'edit'} image. Please try again. Status: ${responseForImage.status}`
					);
				}
			}

			return { success: true, data: result, status: response?.status };
		} catch (err) {
			return fail(response.status, {
				error: err.message,
				success: false,
				data: originalFormData
			});
		}
	}
}
export const actions = {
	review: preserveFormData,
	final: saveFormData
};
