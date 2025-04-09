import { BASE_URL } from '$lib/config';
import { fail } from '@sveltejs/kit';
import { getErrorMessage } from '$lib/utils/helper.js';
import { resourceNames, userActions } from '$lib/data.js';

let modifiedFormdata;
let originalFormData;
let id = '';
let method = '';
let image = '';
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

		if (method?.toLowerCase()?.trim() === 'post') {
			payLoad = {
				email: modifiedFormdata.email,
				username: modifiedFormdata.username,
				traineeProfileDto: {
					enrollId: modifiedFormdata.username,
					candidateName: modifiedFormdata.candidateName,
					// Personal Information
					fatherNameOrHusbandName: modifiedFormdata.fatherNameOrHusbandName,
					maritalStatus: modifiedFormdata.maritalStatus,
					sex: modifiedFormdata.sex,
					dateOfBirth: modifiedFormdata.dateOfBirth,
					age: modifiedFormdata.age,
					religion: modifiedFormdata.religion,
					caste: modifiedFormdata.caste,
					education: modifiedFormdata.education,
					personWithDisability: false,
					aadharCardNo: modifiedFormdata.aadharCardNo,

					// Contact Information
					mobileNumber1: modifiedFormdata.mobileNumber1,
					email: modifiedFormdata.email,

					// Residential Information
					candidateAddress: modifiedFormdata.candidateAddress,
					district: modifiedFormdata.district,
					pincode: modifiedFormdata.pincode
				}
			};
		}
		if (method?.toLowerCase()?.trim() === 'put') {
			payLoad = {
				uuid: id,
				email: modifiedFormdata.email,
				// username:modifiedFormdata.username,

				candidateName: modifiedFormdata.candidateName,
				// Personal Information
				fatherNameOrHusbandName: modifiedFormdata.fatherNameOrHusbandName,
				maritalStatus: modifiedFormdata.maritalStatus,
				sex: modifiedFormdata.sex,
				dateOfBirth: modifiedFormdata.dateOfBirth,
				age: modifiedFormdata.age,
				religion: modifiedFormdata.religion,
				caste: modifiedFormdata.caste,
				education: modifiedFormdata.education,
				personWithDisability: false,
				aadharCardNo: modifiedFormdata.aadharCardNo,

				// Contact Information
				mobileNumber1: modifiedFormdata.mobileNumber1,

				// Residential Information
				candidateAddress: modifiedFormdata.candidateAddress,
				district: modifiedFormdata.district,
				pincode: modifiedFormdata.pincode
			};
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
				response = await fetch(`${BASE_URL}/apis/v1/trainees`, {
					method: 'POST',
					body: dataToSend,
					headers
				});

				if (!response.ok) {
					let { errorMsg } = getErrorMessage({
						status: response?.status,
						action: userActions.ADD,
						module: resourceNames.TRAINEE
					});

					return fail(response.status, {
						error: errorMsg,
						success: false,
						data: originalFormData
					});
				}
			} else if (method === 'PUT') {
				response = await fetch(`${BASE_URL}/apis/v1/trainee-profiles/${id}`, {
					method: 'PUT',
					body: dataToSend,
					headers
				});

				if (!response.ok) {
					let { errorMsg } = getErrorMessage({
						status: response?.status,
						action: userActions.EDIT,
						module: resourceNames.TRAINEE
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
			// if (image instanceof File && image.size > 0) {
			// 	const formDataForImage = new FormData();
			// 	formDataForImage.append('file', image, image.name);

			// 	const responseForImage = await fetch(
			// 		`${BASE_URL}/apis/v1/trainee-profile/${result.uuid}/image`,
			// 		{
			// 			method: 'POST',
			// 			body: formDataForImage,
			// 			headers: headersForImageUpload,
			// 		}
			// 	);

			// 	if(!responseForImage?.ok){
			// 								return { error: 'Successfully updated course details but failed to edit image. Please try again!', data: originalFormData }
			// 							}
			// }

			return { success: true, data: result, status: response.status };
		} catch (err) {
			return fail(response.status, {
				error: err.message,
				success: false,
				data: originalFormData
			});
		}
	}
};
