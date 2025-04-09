// API not ready yet
let modifiedFormdata;
let originalFormData;
let method = '';
let id =''

function preserveFormData() {
	return async ({ request }) => {
		const formData = await request.formData();
		originalFormData = Object.fromEntries(formData.entries());
		id = formData.get('uuid') ? formData.get('uuid') : '';
		method = formData.get('method') ? formData.get('method') : '';
		formData.delete('method');
        formData.delete('phoneno1')
        formData.delete('phoneno2')
        formData.delete('email1')
        formData.delete('email2')
        formData.delete('addressLine1')
        formData.delete('addressLine2')
        formData.delete('cityTown')
        formData.delete('pincode')
        formData.delete('state')
        formData.delete('uuid')

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

		let response;
		try{
			if (method === 'POST') {
				 response = await fetch(
					'http://reap-dev-admin-service.ap-south-1.elasticbeanstalk.com/reap/api/v1/nars',
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
				 response = await fetch(
					`http://reap-dev-admin-service.ap-south-1.elasticbeanstalk.com/reap/api/v1/nars/${id}`,
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
	
			return { success: true, data: data,  status:response?.status };
		}catch(err){
			return { error: 'Failed to submit form. Please try again!', data: originalFormData, status:response?.status };
		}
		} 
}
