
let modifiedFormdata;
let originalFormData;
let id = '';
let method = '';

function preserveFormData() {
	return async ({ request }) => {
		const formData = await request.formData();
		originalFormData = Object.fromEntries(formData.entries());
		id = formData.get('uuid') ? formData.get('uuid') : '';
		method = formData.get('method') ? formData.get('method') : '';
		formData.delete('uuid');
		formData.delete('method');
        formData.delete('phoneno1')
        formData.delete('phoneno2')
        formData.delete('email1')
        formData.delete('email2')
        formData.delete('addressLine1')
        formData.delete('addressLine2')
        formData.delete('cityTown')
        formData.delete('pincode')
		modifiedFormdata = Object.fromEntries(formData.entries()); 
		return {
			data: originalFormData
		};
	};
}

export const actions = {
	review: preserveFormData(),
	final: async () => {
		const data = modifiedFormdata;
		const headers = {
			'Content-Type': 'application/json'
		};
		if (method === 'POST') {
			const response = await fetch(
				'http://reap-dev-admin-service.ap-south-1.elasticbeanstalk.com/reap/api/v1/states',
				{
					method: 'POST',
					headers:headers,
					body: JSON.stringify(data) 
				}
			);
			if (!response.ok || !response.status == 201) {
				return { error: 'Failed to submit form', data: originalFormData };
			}
		}

		if (method === 'PUT') {
			const response = await fetch(
				`http://reap-dev-admin-service.ap-south-1.elasticbeanstalk.com/reap/api/v1/states/${id}`,
				{
					method: 'PUT',
					headers:headers,
					body: JSON.stringify(data) 
				}
			);
			if (!response.ok || !response.status == 200) {
				return { error: 'Failed to submit form', data: originalFormData };
			}
		}

		return { success: true, data: data };
	}
};
