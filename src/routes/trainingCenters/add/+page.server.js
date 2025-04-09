let previewFormData = {};
let method = '';

async function preserveFormData({ request, fetch }) {
	const formData = await request.formData();
	previewFormData = Object.fromEntries(formData.entries());
	// previewFormData = JSON.parse(previewFormData.data);
	method = formData.get('method') || '';

	// TODO handle creating form response and passing it back
	return { saved: true, data: previewFormData };
}

async function saveFormData({ fetch }) {
	let response;
	if (method === 'POST') {
		response = await fetch('/apis/trainingCenters', {
			method: 'POST',
			body: JSON.stringify(previewFormData),
			headers: {
				'content-type': 'application/json'
			}
		});
		if (!response.ok || response.status != 201) {
			if (response.status == 409)
				return {
					error: 'Failed to submit form, rseti id already exists. Please try again!',
					data: previewFormData
				};
			return { error: 'Failed to submit form. Please try again!', data: previewFormData };
		}
	}
	if (method === 'PUT') {
		response = await fetch(`/apis/trainingCenters/${previewFormData.uuid}`, {
			method: 'PUT',
			body: JSON.stringify(previewFormData),
			headers: {
				'content-type': 'application/json'
			}
		});

		if (!response.ok || response.status !== 200) {
			if (response.status == 409)
				return {
					error: 'Failed to submit form, rseti id already exists. Please try again!',
					data: previewFormData
				};
			return { error: 'Failed to submit form. Please try again!', data: previewFormData };
		}
	}

	const respData = await response.json();

	if (respData.error) {
		return {
			formSaved: true,
			error: respData.error
		};
	}

	return {
		formSaved: true,
		message: 'form saved successfully'
	};
}
export const actions = {
	review: preserveFormData,
	final: saveFormData
};
