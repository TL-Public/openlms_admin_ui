import { json } from '@sveltejs/kit';
import { CLIENT_SECRET } from '$env/static/private';
import { QMS_URL } from '$lib/config.js';

export async function GET({ params, request, cookies}) {
	let res;
	try {
		const id = params.id;
		const serviceToken = cookies.get('serviceToken');

		if (serviceToken) {
			let endpoint = `${QMS_URL}/apis/v1/content-question-papers/content/${id}`;
			const options = {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Service-Authorization': 'Bearer ' + serviceToken,
					'Service-Key': CLIENT_SECRET
				}
			};

			res = await fetch(endpoint, options);

			if (res.status == 200) {
				const data = await res.json();
				if (Array.isArray(data) && data[0]) {
					const firstContent = data[0];
					return json(firstContent);
				}
			}

			return json(res, { status: res.status });
		}
	} catch (e) {
		console.error('error in question GET', e.message);
		return json(res, { status: 500 });
	}
}

export async function DELETE({ params, request, cookies, url}) {
	let res;
	let questionPaperUuid = url.searchParams.get('questionPaperUuid')
	try {
		const id = params.id;
		const serviceToken = cookies.get('serviceToken');

		if (serviceToken) {
			let endpoint = `${QMS_URL}/apis/v1/content-question-papers/content/${id}/question-paper/${questionPaperUuid}`;
			const options = {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					'Service-Authorization': 'Bearer ' + serviceToken,
					'Service-Key': CLIENT_SECRET
				}
			};

			res = await fetch(endpoint, options);

			if (res.status == 204) {
				return new Response(null, { status: 204 });
			}

			return json(res, { status: res.status });
		}
	} catch (e) {
		console.error('error in quiz Delete', e.message);
		return json(res, { status: 500 });
	}
}
