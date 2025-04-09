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

async function saveFormData({ request, cookies }) {
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
				response = await fetch(
					'http://read-admin-api-dev.ap-south-1.elasticbeanstalk.com/apis/v1/users',
					{
						method: 'POST',
						body: dataToSend,
						headers
					}
				);

				if (!response.ok || !response.status == 201) {
					if (response.status == 409)
						return {
							error: 'Failed to submit form, user credentials already exist. Please try again!',
							data: originalFormData,
							status: response.status
						};
					return {
						error: 'Failed to submit form. Please try again!',
						data: originalFormData,
						status: response.status
					};
				}
			} else if (method === 'PUT') {
				response = await fetch(
					`http://read-admin-api-dev.ap-south-1.elasticbeanstalk.com/apis/v1/users/${uuid}`,
					{
						method: 'PUT',
						body: dataToSend,
						headers
					}
				);

				if (!response.ok || !response.status == 200) {
					return {
						error: 'Failed to submit form. Please try again!',
						data: originalFormData,
						status: response.status
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
					`http://read-admin-api-dev.ap-south-1.elasticbeanstalk.com/apis/v1/users/${result.uuid}/image`,
					{
						method: 'POST',
						body: formDataForImage,
						headers: headersForImageUpload
					}
				);

				if (!responseForImage?.ok) {
					return {
						error: `Successfully ${method?.toLowerCase() === 'post' ? 'added' : 'edited'} user details but failed to ${method?.toLowerCase() === 'post' ? 'add' : 'edit'} image. Please try again. Status: ${responseForImage.status}`,
						data: originalFormData
					};
				}
			}

			return { success: true, data: result, status: response?.status };
		} catch (err) {
			console.log('error is', err);
			return {
				error: 'Failed to submit form. Please try again!',
				data: originalFormData,
				status: response?.status
			};
		}
	}
}
export const actions = {
	review: preserveFormData,
	final: saveFormData
};
